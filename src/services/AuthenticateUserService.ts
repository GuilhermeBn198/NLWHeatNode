import axios from "axios";
import prismaClient from "../prisma";
import { sign} from "jsonwebtoken";
/**
 * receber code(string) ✔️
 * recuperar o access_token no github ✔️
 * recuperar infos do user no github ✔️
 *  verificar se o user existe no db  ✔️
 * ---- se existir = gera 1 token ✔️
 * ---- se não existir = cria o user no db e gera um token ✔️
 * retorna o token com as infos do user ✔️
 * tratar erro 401 invalid token ✔️
 */

interface IAccessTokenResponse {
	access_token: string
}

interface IUserResponse{
	avatar_url: string,
	login: string,
	id: number,
	name: string
}

class AuthenticateUserService{
	async execute(code: string ) {
		const url = "https://github.com/login/oauth/access_token";

		const { data:  accessTokenResponse} = await axios.post<IAccessTokenResponse>(url, null, {  //recebe o code
			params: {
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code,
			}, 
			headers: {
				"Accept": "application/json"
			}
		})

		const response = await axios.get<IUserResponse>("https://api.github.com/user", { //recupera o access token
			headers: {
				authorization: `Bearer ${accessTokenResponse.access_token}`,
			},
		});


		//recupera infos do usuario no github
		const { login, id, avatar_url, name } = response.data

		let user = await prismaClient.user.findFirst({ //verificar se o user existe no db
			where: {
				github_id: id
			}
		})
		if (!user) { //se não existir, é criado no DB
			await prismaClient.user.create({
				data:{
					github_id: id,
					login, 
					avatar_url,
					name  
				}
			})
		}

		//gera token
		const  token = sign({
			user: {
				name: user.name,
				avatar_url: user.avatar_url,
				id: user.id
			}
		},
		process.env.JWT_SECRET,
		{
			subject: user.id,
			expiresIn: "1d"
		}
		)

		return { token, user }; //retorna o token e as infos do user
	}
}

export { AuthenticateUserService }