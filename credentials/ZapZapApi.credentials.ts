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
			description: 'API key (x-api-key header). Get it in the panel at app.zapzapapi.com > Settings.',
		},
		{
			displayName: 'API Secret',
			name: 'apiSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'API secret (x-api-secret header). Get it in the panel at app.zapzapapi.com > Settings.',
		},
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://api.zapzapapi.com/api/v1',
			description: 'API base URL. Change it only if you run a self-hosted install of the ZapZap API.',
		},
	];

	// Injects the authentication headers into every request made with this credential.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'x-api-key': '={{$credentials.apiKey}}',
				'x-api-secret': '={{$credentials.apiSecret}}',
			},
		},
	};

	// "Test" button in the UI: validates the credentials by calling GET /account.
	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '/account',
			method: 'GET',
		},
	};
}
