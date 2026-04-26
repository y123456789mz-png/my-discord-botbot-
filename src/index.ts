    Argument of type 'string | 10000' is not assignable to parameter of type 'number'.
      Type 'string' is not assignable to type 'number'.
  Overload 2 of 6, '(port: number, hostname: string, callback?: () => void): Server<typeof IncomingMessage, typeof ServerResponse>', gave the following error.
    Argument of type 'string | 10000' is not assignable to parameter of type 'number'.
      Type 'string' is not assignable to type 'number'.
src/voice.ts(22,27): error TS2307: Cannot find module './ai' or its corresponding type declarations.
src/voice.ts(202,5): error TS2322: Type 'InternalDiscordGatewayAdapterCreator' is not assignable to type 'DiscordGatewayAdapterCreator'.
  Types of parameters 'methods' and 'methods' are incompatible.
    Type 'DiscordGatewayAdapterLibraryMethods' is not assignable to type 'InternalDiscordGatewayAdapterLibraryMethods'.
      Types of property 'onVoiceStateUpdate' are incompatible.
        Type '(data: GatewayVoiceState) => void' is not assignable to type '(data: APIVoiceState) => void'.
          Types of parameters 'data' and 'data' are incompatible.
            Type 'APIVoiceState' is not assignable to type 'GatewayVoiceState'.
              The types of 'member.flags' are incompatible between these types.
                Type 'import("/opt/render/project/src/node_modules/.pnpm/discord-api-types@0.38.47/node_modules/discord-api-types/payloads/v10/guild").GuildMemberFlags' is not assignable to type 'import("/opt/render/project/src/node_modules/.pnpm/discord-api-types@0.37.83/node_modules/discord-api-types/payloads/v10/guild").GuildMemberFlags'.
                  Property 'IsGuest' is missing in type 'import("/opt/render/project/src/node_modules/.pnpm/discord-api-types@0.37.83/node_modules/discord-api-types/payloads/v10/guild").GuildMemberFlags'.
Ignoring TS errors and continuing...
==> Uploading build...
==> Uploaded in 1.9s. Compression took 1.7s
==> Build successful 🎉
==> Deploying...
==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
==> Running 'pnpm start'
> toriel-bot@1.0.0 start /opt/render/project/src
> node dist/index.js
node:internal/modules/esm/resolve:275
    throw new ERR_MODULE_NOT_FOUND(
          ^
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/opt/render/project/src/dist/ai.js' imported from /opt/render/project/src/dist/index.js
    at finalizeResolution (node:internal/modules/esm/resolve:275:11)
    at moduleResolve (node:internal/modules/esm/resolve:865:10)
    at defaultResolve (node:internal/modules/esm/resolve:991:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:719:20)
    at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:736:38)
    at ModuleLoader.resolveSync (node:internal/modules/esm/loader:765:52)
    at #resolve (node:internal/modules/esm/loader:701:17)
    at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:621:35)
    at ModuleJob.syncLink (node:internal/modules/esm/module_job:160:33)
    at ModuleJob.link (node:internal/modules/esm/module_job:245:17) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///opt/render/project/src/dist/ai.js'
}
Node.js v24.14.1
 ELIFECYCLE  Command failed with exit code 1.
==> Exited with status 1
==> Common ways to troubleshoot your deploy: https://render.com/docs/troubleshooting-deploys
