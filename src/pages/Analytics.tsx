import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import { useStore } from '../hooks/useStore'
import type { CallOutcome, LeadStatus, Lead } from '../types'

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const PageTitle = styled.h1`
  margin: 0;
  color: #1f2937;
  font-size: 32px;
  font-weight: 700;
`

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
`

const ChartCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`

const ChartHeader = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
`

const ChartTitle = styled.h3`
  margin: 0;
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
`

const ChartContent = styled.div`
  padding: 24px;
`

const PieChart = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
`

const PieChartSvg = styled.svg`
  width: 200px;
  height: 200px;
`

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background-color: ${props => props.$color};
`

const LegendLabel = styled.span`
  color: #4b5563;
  font-size: 14px;
`

const LegendValue = styled.span`
  color: #1f2937;
  font-weight: 600;
  margin-left: auto;
`

const BarChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const BarItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const BarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const BarLabelText = styled.span`
  color: #4b5563;
  font-size: 14px;
`

const BarValue = styled.span`
  color: #1f2937;
  font-weight: 600;
  font-size: 14px;
`

const BarTrack = styled.div`
  height: 8px;
  background-color: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
`

const BarFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background-color: ${props => props.$color};
  border-radius: 4px;
  transition: width 0.3s ease;
`

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`

const MetricCard = styled.div`
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  text-align: center;
`

const MetricValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`

const MetricLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
  grid-column: 1 / -1;
`

const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  Hot: '#dc2626',
  Warm: '#d97706',
  Cold: '#0284c7'
}

const CALL_OUTCOME_COLORS: Record<CallOutcome, string> = {
  connected: '#059669',
  voicemail: '#d97706',
  'no-answer': '#6b7280',
  busy: '#ef4444',
  'meeting-scheduled': '#059669',
  'not-interested': '#dc2626',
  'callback-requested': '#8b5cf6'
}

const formatOutcome = (outcome: string) => {
  return outcome.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export const Analytics: React.FC = observer(() => {
  const { leadStore, callLogStore } = useStore()

  const leadsByStatus = leadStore.leadsByStatus
  const totalLeads = leadStore.totalLeads
  
  const callLogs = callLogStore.callLogs
  const totalCalls = callLogStore.totalCallLogs
  const callsToday = callLogStore.callsToday.length
  const callsThisWeek = callLogStore.callsThisWeek.length
  const avgCallsPerDay = callLogStore.averageCallsPerDay

  // Calculate call outcomes distribution
  const outcomeStats = callLogs.reduce((acc: Record<CallOutcome, number>, call) => {
    acc[call.outcome] = (acc[call.outcome] || 0) + 1
    return acc
  }, {} as Record<CallOutcome, number>)

  // Calculate total call duration
  const totalDuration = callLogs.reduce((sum: number, call) => sum + call.duration, 0)
  const avgDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0

  // Calculate conversion rates
  const connectedCalls = outcomeStats.connected || 0
  const meetingsScheduled = outcomeStats['meeting-scheduled'] || 0
  const connectionRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0
  const conversionRate = totalCalls > 0 ? Math.round((meetingsScheduled / totalCalls) * 100) : 0

  // Generate pie chart data for lead status
  const statusPieData = Object.entries(leadsByStatus).map(([status, leads]) => ({
    label: status,
    value: (leads as Lead[]).length,
    color: LEAD_STATUS_COLORS[status as LeadStatus],
    percentage: totalLeads > 0 ? ((leads as Lead[]).length / totalLeads) * 100 : 0
  })).filter(item => item.value > 0)

  // Generate pie chart SVG path
  const generatePieSlices = (data: typeof statusPieData) => {
    let cumulativePercentage = 0
    return data.map((item, index) => {
      const startAngle = cumulativePercentage * 3.6 // Convert percentage to degrees
      const endAngle = (cumulativePercentage + item.percentage) * 3.6
      cumulativePercentage += item.percentage

      const startAngleRad = (startAngle - 90) * (Math.PI / 180)
      const endAngleRad = (endAngle - 90) * (Math.PI / 180)

      const largeArcFlag = item.percentage > 50 ? 1 : 0

      const x1 = 100 + 80 * Math.cos(startAngleRad)
      const y1 = 100 + 80 * Math.sin(startAngleRad)
      const x2 = 100 + 80 * Math.cos(endAngleRad)
      const y2 = 100 + 80 * Math.sin(endAngleRad)

      return (
        <path
          key={index}
          d={`M 100,100 L ${x1},${y1} A 80,80 0 ${largeArcFlag},1 ${x2},${y2} z`}
          fill={item.color}
          stroke="white"
          strokeWidth="2"
        />
      )
    })
  }

  // Generate bar chart data for call outcomes
  const maxOutcomeCount = Math.max(...Object.values(outcomeStats))
  const outcomeBarData = Object.entries(outcomeStats).map(([outcome, count]) => ({
    label: formatOutcome(outcome),
    value: count as number,
    percentage: maxOutcomeCount > 0 ? ((count as number) / maxOutcomeCount) * 100 : 0,
    color: CALL_OUTCOME_COLORS[outcome as CallOutcome]
  }))

  if (totalLeads === 0 && totalCalls === 0) {
    return (
      <Container>
        <PageTitle>Analytics</PageTitle>
        <EmptyState>
          No data available yet. Add some leads and log some calls to see your analytics.
        </EmptyState>
      </Container>
    )
  }

  return (
    <Container>
      <PageTitle>Analytics</PageTitle>

      <MetricsGrid>
        <MetricCard>
          <MetricValue>{totalLeads}</MetricValue>
          <MetricLabel>Total Leads</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{totalCalls}</MetricValue>
          <MetricLabel>Total Calls</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{callsToday}</MetricValue>
          <MetricLabel>Calls Today</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{callsThisWeek}</MetricValue>
          <MetricLabel>Calls This Week</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{avgCallsPerDay}</MetricValue>
          <MetricLabel>Avg Calls/Day</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{avgDuration}min</MetricValue>
          <MetricLabel>Avg Call Duration</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{connectionRate}%</MetricValue>
          <MetricLabel>Connection Rate</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{conversionRate}%</MetricValue>
          <MetricLabel>Meeting Conversion</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      <ChartsGrid>
        {totalLeads > 0 && (
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Lead Status Distribution</ChartTitle>
            </ChartHeader>
            <ChartContent>
              <PieChart>
                <PieChartSvg viewBox="0 0 200 200">
                  {generatePieSlices(statusPieData)}
                </PieChartSvg>
                <Legend>
                  {statusPieData.map((item, index) => (
                    <LegendItem key={index}>
                      <LegendColor $color={item.color} />
                      <LegendLabel>{item.label}</LegendLabel>
                      <LegendValue>{item.value.toString()}</LegendValue>
                    </LegendItem>
                  ))}
                </Legend>
              </PieChart>
            </ChartContent>
          </ChartCard>
        )}

        {totalCalls > 0 && (
          <ChartCard>
            <ChartHeader>
              <ChartTitle>Call Outcomes</ChartTitle>
            </ChartHeader>
            <ChartContent>
              <BarChart>
                {outcomeBarData.map((item, index) => (
                  <BarItem key={index}>
                    <BarLabel>
                      <BarLabelText>{item.label}</BarLabelText>
                      <BarValue>{item.value}</BarValue>
                    </BarLabel>
                    <BarTrack>
                      <BarFill $percentage={item.percentage} $color={item.color} />
                    </BarTrack>
                  </BarItem>
                ))}
              </BarChart>
            </ChartContent>
          </ChartCard>
        )}
      </ChartsGrid>
    </Container>
  )
})