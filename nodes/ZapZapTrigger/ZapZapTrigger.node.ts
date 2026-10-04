import {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
	JsonObject,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';

export class ZapZapTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'ZapZap Trigger',
		name: 'zapZapTrigger',
		icon: 'file:zapzap.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '=Events: {{$parameter["events"].length ? $parameter["events"].join(", ") : "all"}}',
		description: 'Receive events from a ZapZap instance (messages, connection and more) via webhook',
		defaults: {
			name: 'ZapZap Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'zapZapApi',
				required: true,
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
				displayName:
					'The webhook is registered on your instance automatically when you activate the workflow, and removed when you deactivate it. Just set the Instance ID below. In production n8n needs a public HTTPS domain.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Instance ID',
				name: 'instanceId',
				type: 'string',
				required: true,
				default: '',
				placeholder: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
				description:
					'Identifier of the WhatsApp instance whose webhook will be registered (the UUID from creating or listing instances)',
				displayOptions: {
					show: { manualSetup: [false] },
				},
			},
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				default: [],
				description:
					'Events that trigger the workflow. Empty means the main events (messages, connection, status).',
				options: [
					{ name: 'Chats', value: 'chats', description: 'Chat created, updated or removed' },
					{ name: 'Connection', value: 'connection', description: 'Connection state changed' },
					{ name: 'Contacts', value: 'contacts', description: 'Contact created or updated' },
					{ name: 'Groups', value: 'groups', description: 'Group and participant changes' },
					{ name: 'Messages', value: 'messages', description: 'Incoming and outgoing messages' },
					{ name: 'Messages Update', value: 'messages_update', description: 'Delivery status (sent, delivered, read)' },
					{ name: 'Presence', value: 'presence', description: 'Online, offline and typing. High volume.' },
				],
			},
			{
				displayName: 'Set Webhook Manually',
				name: 'manualSetup',
				type: 'boolean',
				default: false,
				description:
					'Whether to skip auto-registration and point the instance webhook yourself, in the ZapZap panel or via the API. Leave off to let this node register and remove the webhook automatically.',
			},
		],
	};

	webhookMethods = {
		default: {
			// Check whether the instance webhook already points to this n8n URL.
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const manualSetup = this.getNodeParameter('manualSetup', false) as boolean;
				if (manualSetup) {
					// Manual setup: the node does not manage the webhook, so there is nothing to create.
					return true;
				}

				const instanceId = ((this.getNodeParameter('instanceId', '') as string) || '').trim();
				if (!instanceId) {
					// Without an Instance ID there is nothing to check: force create() to raise a clear error.
					return false;
				}

				const webhookUrl = this.getNodeWebhookUrl('default');
				const credentials = await this.getCredentials('zapZapApi');
				const baseUrl = ((credentials.baseUrl as string) || 'https://api.zapzapapi.com/api/v1').replace(/\/+$/, '');

				try {
					const current = (await this.helpers.httpRequestWithAuthentication.call(this, 'zapZapApi', {
						method: 'GET',
						url: `${baseUrl}/instances/${instanceId}/webhook`,
						json: true,
					})) as IDataObject;
					return current.webhook_url === webhookUrl;
				} catch {
					// Lookup failed: let create() try to register it.
					return false;
				}
			},

			// Register the instance webhook pointing to this n8n URL (when the workflow is activated).
			async create(this: IHookFunctions): Promise<boolean> {
				const manualSetup = this.getNodeParameter('manualSetup', false) as boolean;
				if (manualSetup) {
					return true;
				}

				const instanceId = ((this.getNodeParameter('instanceId', '') as string) || '').trim();
				if (!instanceId) {
					throw new NodeOperationError(
						this.getNode(),
						'Set the Instance ID to register the webhook automatically, or turn on "Set Webhook Manually".',
					);
				}

				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) {
					throw new NodeOperationError(this.getNode(), 'Could not obtain the n8n webhook URL.');
				}

				const events = this.getNodeParameter('events', []) as string[];
				const credentials = await this.getCredentials('zapZapApi');
				const baseUrl = ((credentials.baseUrl as string) || 'https://api.zapzapapi.com/api/v1').replace(/\/+$/, '');

				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'zapZapApi', {
						method: 'PUT',
						url: `${baseUrl}/instances/${instanceId}/webhook`,
						body: { webhook_url: webhookUrl, events },
						json: true,
					});
				} catch (error) {
					throw new NodeApiError(this.getNode(), error as JsonObject, {
						message: 'Could not register the webhook automatically on ZapZap.',
						description:
							'ZapZap requires a public HTTPS URL (anti-SSRF protection). In production n8n has an HTTPS domain and registration works. On a local setup (http/localhost) the URL is rejected: in that case point the webhook from the app.zapzapapi.com panel, or turn on "Set Webhook Manually".',
					});
				}

				return true;
			},

			// Remove the instance webhook (when the workflow is deactivated).
			async delete(this: IHookFunctions): Promise<boolean> {
				const manualSetup = this.getNodeParameter('manualSetup', false) as boolean;
				if (manualSetup) {
					return true;
				}

				const instanceId = ((this.getNodeParameter('instanceId', '') as string) || '').trim();
				if (!instanceId) {
					return true;
				}

				const credentials = await this.getCredentials('zapZapApi');
				const baseUrl = ((credentials.baseUrl as string) || 'https://api.zapzapapi.com/api/v1').replace(/\/+$/, '');

				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'zapZapApi', {
						method: 'PUT',
						url: `${baseUrl}/instances/${instanceId}/webhook`,
						body: { webhook_url: '' },
						json: true,
					});
				} catch {
					// Best effort: if the API refuses to clear the URL, ignore it.
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const body = this.getBodyData() as IDataObject;
		const selected = this.getNodeParameter('events', []) as string[];
		const event = body.event as string | undefined;

		// Event filter: if the user selected events and this one is not in the list,
		// reply 200 (so ZapZap does not disable the webhook) but do not trigger the workflow.
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
