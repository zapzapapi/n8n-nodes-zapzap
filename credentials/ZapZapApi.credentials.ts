import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ZapZapApi implements ICredentialType {
	name = 'zapZapApi';

	displayName = 'ZapZap API';

	documentationUrl = 'https://zapzapapi.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Chave da API (header x-api-key). Pegue no painel em app.zapzapapi.com > Configurações.',
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Segredo da API (header x-api-secret). Pegue no painel em app.zapzapapi.com > Configurações.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.zapzapapi.com/api/v1',
			description: 'URL base da API. Só mude se usar uma instalação self-hosted da ZapZap API.',
		},
	];

	// Injeta os headers de autenticação em toda requisição feita com esta credencial.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
				'x-api-secret': '={{$credentials.apiSecret}}',
			},
		},
	};

	// Botão "Test" na UI: valida as credenciais chamando GET /account.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/account',
			method: 'GET',
		},
	};
}
