"use client"

import { Content } from "../globals/Content"
import { ExecProvider, useExec } from "./components/Context"
import { ExecutiveMember } from "./components/ExecutiveMember"
import { ExecutiveFilter } from "./components/ExecutiveFilter"
import { ExecutiveCategory } from "./components/ExecutiveCategory"

function ExecPageContent() {
  const {
    activeYear,
    filteredExecutives,
    executivesByYear,
  } = useExec()

  return (
    <div className="min-w-0 overflow-x-hidden">
      <Content className="px-4 sm:px-6 lg:px-8">
        <div className="my-10 flex flex-col gap-2">
          <Content.Title as="h1">Executive Board</Content.Title>
          <Content.Subtitle>
            Meet the leaders of PantherWeb
          </Content.Subtitle>
          <Content.Description className="max-w-2xl">
            Our executive board works to create opportunities for learning,
            building, and connecting within Georgia State&apos;s web development
            community.
          </Content.Description>
        </div>

        <div className="flex flex-col gap-10">
          <ExecutiveFilter />

          {activeYear ? (
            <ExecutiveCategory title={activeYear}>
              {filteredExecutives.map((exec) => (
                <ExecutiveMember key={exec.id}>
                  <ExecutiveMember.Image
                    src={exec.image}
                    alt={exec.name}
                    width={320}
                    height={320}
                  />
                  <ExecutiveMember.Details>
                    <ExecutiveMember.Name>{exec.name}</ExecutiveMember.Name>
                    <ExecutiveMember.Role>{exec.role}</ExecutiveMember.Role>
                    {exec.description && (
                      <ExecutiveMember.Description>
                        {exec.description}
                      </ExecutiveMember.Description>
                    )}
                  </ExecutiveMember.Details>
                </ExecutiveMember>
              ))}
            </ExecutiveCategory>
          ) : (
            Array.from(executivesByYear.entries())
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([year, members]) => (
                <ExecutiveCategory key={year} title={year}>
                  {members.map((exec) => (
                    <ExecutiveMember key={exec.id}>
                      <ExecutiveMember.Image
                        src={exec.image}
                        alt={exec.name}
                        width={320}
                        height={320}
                      />
                      <ExecutiveMember.Details>
                        <ExecutiveMember.Name>{exec.name}</ExecutiveMember.Name>
                        <ExecutiveMember.Role>{exec.role}</ExecutiveMember.Role>
                        {exec.description && (
                          <ExecutiveMember.Description>
                            {exec.description}
                          </ExecutiveMember.Description>
                        )}
                      </ExecutiveMember.Details>
                    </ExecutiveMember>
                  ))}
                </ExecutiveCategory>
              ))
          )}
        </div>
      </Content>
    </div>
  )
}

export default function ExecPage() {
  return (
    <ExecProvider>
      <ExecPageContent />
    </ExecProvider>
  )
}
