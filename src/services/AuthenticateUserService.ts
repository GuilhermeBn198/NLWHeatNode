import axios from "axios";
/**
 * receber code(string) ✔️
 * recuperar o access_token no github ✔️
 * recuperar infos do user no github ✔️
 *  verificar se o user existe no db 
 * ---- se existir = gera 1 token
 * ---- se não existir = cria o user no db e gera um token
 * retorna o token com as infos do user
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

		const { data:  accessTokenResponse} = await axios.post<IAccessTokenResponse>(url, null, { 
			params: {
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code,
			}, 
			headers: {
				"Accept": "application/json"
			}
		})

		const response = await axios.get<IUserResponse>("https://api.github.com/user", {
			headers: {
				authorization: `Bearer ${accessTokenResponse.access_token}`,
			},
		});

		return response.data;
	}
}

export { AuthenticateUserService }