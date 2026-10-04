import {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

export class ZapZapTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ZapZap Trigger',
		name: 'zapZapTrigger',
		icon: 'file:zapzap.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '=Eventos: {{$parameter["events"].length ? $parameter["events"].join(", ") : "todos"}}',
		description: 'Recebe eventos de uma instância ZapZap (mensagens, conexão, etc) via webhook',
		defaults: {
			name: 'ZapZap Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'zapZapApi',
				required: false,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Copie a "Production URL" desta aba e aponte o webhook da sua instância para ela — no painel app.zapzapapi.com ou via <code>PUT /instances/{ID}/webhook</code>. Ou ligue "Registrar Webhook Automaticamente" abaixo.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				default: [],
				description: 'Eventos que disparam o fluxo. Vazio = todos os eventos.',
				options: [
					{ name: 'Chats', value: 'chats' },
					{ name: 'Connection', value: 'connection', description: 'Mudança de estado da conexão' },
					{ name: 'Contacts', value: 'contacts' },
					{ name: 'Groups', value: 'groups' },
					{ name: 'Messages', value: 'messages', description: 'Mensagens recebidas/enviadas' },
					{ name: 'Messages Update', value: 'messages_update', description: 'Status de entrega (sent/delivered/read)' },
					{ name: 'Presence', value: 'presence' },
				],
			},
			{
				displayName: 'Registrar Webhook Automaticamente',
				name: 'autoRegister',
				type: 'boolean',
				default: false,
				description:
					'Whether to point the instance webhook_url to this trigger URL automatically on activation (requires credential + Instance ID)',
			},
			{
				displayName: 'Instance ID',
				name: 'instanceId',
				type: 'string',
				default: '',
				placeholder: 'uuid-da-instancia',
				description: 'ID da instância cujo webhook será registrado automaticamente',
				displayOptions: {
					show: { autoRegister: [true] },
				},
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', false) as boolean;
				// Sem auto-registro, assume configuração manual (sempre "existe").
				// Com auto-registro, retorna false para que create() reescreva a URL atual.
				return !autoRegister;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', false) as boolean;
				const instanceId = this.getNodeParameter('instanceId', '') as string;
				if (!autoRegister || !instanceId) {
					// Registro manual: nada a fazer aqui.
					return true;
				}

				const webhookUrl = this.getNodeWebhookUrl('default');
				const credentials = await this.getCredentials('zapZapApi');
				const baseUrl = (credentials.baseUrl as string) || 'https://api.zapzapapi.com/api/v1';

				await this.helpers.httpRequestWithAuthentication.call(this, 'zapZapApi', {
					method: 'PUT',
					url: `${baseUrl}/instances/${instanceId}/webhook`,
					body: { webhook_url: webhookUrl },
					json: true,
				});

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const autoRegister = this.getNodeParameter('autoRegister', false) as boolean;
				const instanceId = this.getNodeParameter('instanceId', '') as string;
				if (!autoRegister || !instanceId) {
					return true;
				}

				const credentials = await this.getCredentials('zapZapApi');
				const baseUrl = (credentials.baseUrl as string) || 'https://api.zapzapapi.com/api/v1';

				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'zapZapApi', {
						method: 'PUT',
						url: `${baseUrl}/instances/${instanceId}/webhook`,
						body: { webhook_url: '' },
						json: true,
					});
				} catch {
					// Melhor-esforço: se a API recusar limpar a URL, ignora.
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const selected = this.getNodeParameter('events', []) as string[];
		const event = body.event as string | undefined;

		// Filtro de eventos: se o usuário selecionou eventos e este não está na lista,
		// responde 200 (para a ZapZap não desativar o webhook) mas não dispara o fluxo.
		if (selected.length > 0 && event && !selected.includes(event)) {
			return {
				webhookResponse: { ok: true },
			};
		}

		return {
			webhookResponse: { ok: true },
			workflowData: [this.helpers.returnJsonArray(body)],
		};
	}
}
