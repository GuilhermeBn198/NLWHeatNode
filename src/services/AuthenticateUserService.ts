import axios from "axios";
/**
 * receber code(string) ✔️
 * recuperar o access_token no github
 *  verificar se o user existe no db
 * ---- se existir = gera 1 token
 * ---- se não existir = cria o user no db e gera um token
 * retorna o token com as infos do user
 */

class AuthenticateUserService{
	async execute(code: string ) {
		const url = "https://github.com/login/oauth/access_token";

		const response = await axios.post(url, null, { 
			params: {
				client_id: process.env.GITHUB_CLIENT_ID,
				client_secret: process.env.GITHUB_CLIENT_SECRET,
				code,
			}, 
			headers: {
				"Accept": "application/json"
			}
		})
		return response.data;
	}
}

export { AuthenticateUserService }