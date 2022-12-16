import type { LoaderArgs } from "@remix-run/server-runtime";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import invariant from "tiny-invariant";
import { Container } from "~/components/layout/Container";
import { Body } from "~/components/primitives/text/Body";
import {
  Header1,
  Header2,
  Header3,
} from "~/components/primitives/text/Headers";
import { useCurrentOrganization } from "~/hooks/useOrganizations";
import { getConnectedApiConnectionsForOrganizationSlug } from "~/models/apiConnection.server";
import {
  ConnectButton,
  integrations,
} from "~/routes/resources/integration/connect";
import { requireUserId } from "~/services/session.server";
import logoGithub from "~/assets/images/integrations/logo-github.png";
import logoTrello from "~/assets/images/integrations/logo-trello.png";
import logoAirtable from "~/assets/images/integrations/logo-airtable.png";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  const { organizationSlug } = params;
  invariant(organizationSlug, "organizationSlug not found");

  const connections = await getConnectedApiConnectionsForOrganizationSlug({
    slug: organizationSlug,
  });

  return typedjson({ connections });
};

export default function Integrations() {
  const { connections } = useTypedLoaderData<typeof loader>();
  const organization = useCurrentOrganization();
  invariant(organization, "Organization not found");

  return (
    <Container>
      <Header1 className="mb-6">API Integrations</Header1>
      <div>
        {connections.length === 0 ? (
          <></>
        ) : (
          <>
            <Header2 size="small" className="mb-2 text-slate-400">
              {connections.length} connected integration
              {connections.length > 1 ? "s" : ""}
            </Header2>
            <div className="overflow-hidden bg-slate-850 shadow sm:rounded-md mb-10">
              <ul className="divide-y divide-slate-800">
                {connections.map((connection) => (
                  <li key={connection.id}>
                    <div className="flex gap-4 items-center px-4 py-4">
                      <img
                        className="h-14 w-14"
                        src={logoGithub}
                        alt="Github integration logo"
                      />
                      <div className="flex flex-col gap-2">
                        <Header3 size="small" className="truncate font-medium">
                          {connection.title}
                        </Header3>
                        <div className="flex items-center gap-1">
                          <ArrowsRightLeftIcon
                            className="h-5 w-5 flex-shrink-0 text-slate-400"
                            aria-hidden="true"
                          />
                          <Body size="small" className="text-slate-400">
                            Active in 100,000 workflows
                          </Body>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      <div>
        <Header2 size="small" className="mb-2 text-slate-400">
          Add an integration
        </Header2>
        {integrations.map((integration) => (
          <ConnectButton
            key={integration.key}
            integration={integration}
            organizationId={organization.id}
          />
        ))}
      </div>
    </Container>
  );
}
