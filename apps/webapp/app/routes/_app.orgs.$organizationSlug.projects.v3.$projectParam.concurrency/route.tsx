import { BookOpenIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/20/solid";
import { Outlet } from "@remix-run/react";
import { Feedback } from "~/components/Feedback";
import { EnvironmentLabel } from "~/components/environments/EnvironmentLabel";
import { PageBody, PageContainer } from "~/components/layout/AppLayout";
import { Button, LinkButton } from "~/components/primitives/Buttons";
import { Header2 } from "~/components/primitives/Headers";
import { NavBar, PageAccessories, PageTitle } from "~/components/primitives/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "~/components/primitives/Table";
import { docsPath } from "~/utils/pathBuilder";

export default function Page() {
  return (
    <PageContainer>
      <NavBar>
        <PageTitle title="Concurrency" />
        <PageAccessories>
          <LinkButton
            LeadingIcon={BookOpenIcon}
            to={docsPath("v3/queue-concurrency")}
            variant="minimal/small"
          >
            Concurrency docs
          </LinkButton>
        </PageAccessories>
      </NavBar>
      <PageBody>
        <div className="mb-3 flex items-center justify-between">
          <Header2>Account limits</Header2>
          <Feedback
            defaultValue="increase concurrency"
            button={
              <Button
                variant="tertiary/small"
                LeadingIcon={ChatBubbleLeftEllipsisIcon}
                data-action="help & feedback"
              >
                Request more concurrency
              </Button>
            }
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Concurrency limit</TableHeaderCell>
              <TableHeaderCell>Queued</TableHeaderCell>
              <TableHeaderCell>Executing</TableHeaderCell>
              <TableHeaderCell>Age of oldest message</TableHeaderCell>
              <TableHeaderCell>Description</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>10</TableCell>
              <TableCell>5</TableCell>
              <TableCell>4</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your organization, Trigger.dev.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <EnvironmentLabel environment={{ type: "DEVELOPMENT" }} />
              </TableCell>
              <TableCell>5</TableCell>
              <TableCell>5</TableCell>
              <TableCell>4</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your development environment.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <EnvironmentLabel environment={{ type: "STAGING" }} />
              </TableCell>
              <TableCell>5</TableCell>
              <TableCell>0</TableCell>
              <TableCell>0</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your staging environment.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <EnvironmentLabel environment={{ type: "PRODUCTION" }} />
              </TableCell>
              <TableCell>5</TableCell>
              <TableCell>5</TableCell>
              <TableCell>4</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your production environment.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <Header2 className="mb-3 mt-6">Task limits</Header2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Task ID</TableHeaderCell>
              <TableHeaderCell>Concurrency limit</TableHeaderCell>
              <TableHeaderCell>Queued</TableHeaderCell>
              <TableHeaderCell>Executing</TableHeaderCell>
              <TableHeaderCell>Age of oldest message</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>10</TableCell>
              <TableCell>5</TableCell>
              <TableCell>4</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your organization, Trigger.dev.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <EnvironmentLabel environment={{ type: "DEVELOPMENT" }} />
              </TableCell>
              <TableCell>5</TableCell>
              <TableCell>5</TableCell>
              <TableCell>4</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your development environment.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <EnvironmentLabel environment={{ type: "STAGING" }} />
              </TableCell>
              <TableCell>5</TableCell>
              <TableCell>0</TableCell>
              <TableCell>0</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your staging environment.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <EnvironmentLabel environment={{ type: "PRODUCTION" }} />
              </TableCell>
              <TableCell>5</TableCell>
              <TableCell>5</TableCell>
              <TableCell>4</TableCell>
              <TableCell>Date here</TableCell>
              <TableCell>Maximum concurrency for your production environment.</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </PageBody>
    </PageContainer>
  );
}