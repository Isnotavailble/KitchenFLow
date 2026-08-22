import React, { useState, useEffect, useCallback } from 'react'
import {
  DollarSign,
  ShoppingBag,
  Flame,
  RefreshCw,
  TrendingUp,
  Award,
  Users,
  Archive,
  Clock,
  Zap,
  Receipt
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import AdminPageHeader from '../components/AdminPageHeader'
import { salesApi } from '../../sales/api/salesApi'
import { formatMMK, formatNumber } from '../../../utils/formatPrice'
import { useToast } from '../../../hooks/useToast'

// --- 1. Custom Single Vertical Line Cursor for Sales Trends BarChart ---
function CustomLineCursor({ x, y, width, height }) {
  if (typeof x !== 'number' || typeof y !== 'number') return null
  const midX = x + width / 2
  return (
    <line
      x1={midX}
      y1={y}
      x2={midX}
      y2={y + height}
      stroke="#CBD5E1"
      strokeWidth={1}
    />
  )
}

// --- 2. Custom Single Horizontal Line Cursor for Menu Performance BarChart ---
function CustomHorizontalLineCursor({ x, y, width, height }) {
  if (typeof x !== 'number' || typeof y !== 'number') return null
  const midY = y + height / 2
  return (
    <line
      x1={x}
      y1={midY}
      x2={x + width}
      y2={midY}
      stroke="#CBD5E1"
      strokeWidth={1}
    />
  )
}

// --- 3. Isolated Sales Trend Chart Component ---
function SalesTrendChartCard({ refreshTrigger }) {
  const [period, setPeriod] = useState('DAILY') // 'DAILY', 'WEEKLY', 'MONTHLY'
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true)
      const data = await salesApi.getTrends(period)
      setTrends(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load trends:', err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    fetchTrends()
  }, [fetchTrends, refreshTrigger])

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col">
      {/* Card Header with localized period switcher */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C39] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Sales Trends</h3>
            <span className="text-[10px] text-zinc-400 font-medium">
              {period === 'DAILY'
                ? 'Today 24-hour volume and revenue'
                : period === 'WEEKLY'
                ? 'Current week (Monday to Sunday)'
                : 'Current month progression (Day 1 - 31)'}
            </span>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80">
          {['DAILY', 'WEEKLY', 'MONTHLY'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                period === p
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {p === 'DAILY' ? 'Daily' : p === 'WEEKLY' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-64 w-full relative">

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={trends}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#71717A' }}
              interval={period === 'DAILY' ? 2 : 0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#71717A' }}
              tickFormatter={(val) => (val >= 1000 ? `${Math.round(val / 1000)}k` : val)}
            />
            <Tooltip
              cursor={<CustomLineCursor />}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-md text-xs font-sans select-none">
                      <span className="font-bold text-zinc-900 block">{data.key || data.label}</span>
                      <div className="text-zinc-600 mt-1 space-y-0.5">
                        <div className="flex justify-between space-x-4">
                          <span className="text-zinc-400">Revenue:</span>
                          <span className="font-bold text-[#FF5C39]">{formatMMK(data.revenue)}</span>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-zinc-400">Orders:</span>
                          <span className="font-bold text-zinc-800">{data.orderCount} tickets</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar
              dataKey="revenue"
              fill="#FF5C39"
              radius={[4, 4, 0, 0]}
              maxBarSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// --- 4. Isolated Peak Operation Times Curve Component ---
function PeakHoursCurveCard({ refreshTrigger }) {
  const [minuteInterval, setMinuteInterval] = useState(15) // 15, 30, 60
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPeakTrends = useCallback(async () => {
    try {
      setLoading(true)
      const data = await salesApi.getTrends('DAILY', minuteInterval)
      setTrends(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to load peak operational trends:', err)
    } finally {
      setLoading(false)
    }
  }, [minuteInterval])

  useEffect(() => {
    fetchPeakTrends()
  }, [fetchPeakTrends, refreshTrigger])

  // Peak and Lowest operational points for the selected minute duration
  const peakPoint = trends.length > 0
    ? trends.reduce((max, item) => (item.orderCount > (max?.orderCount || 0) ? item : max), trends[0])
    : null

  const lowestPoint = trends.length > 0
    ? trends.reduce((min, item) => (item.orderCount < (min?.orderCount ?? Infinity) ? item : min), trends[0])
    : null

  // Format labels & values
  const peakTimeLabel = peakPoint ? (peakPoint.key || peakPoint.label) : '-'
  const peakOrdersCount = peakPoint?.orderCount || 0
  const lowestTimeLabel = lowestPoint ? (lowestPoint.key || lowestPoint.label) : '-'
  const lowestOrdersCount = lowestPoint?.orderCount || 0

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
      {/* Header with Title & Minute Duration Switcher */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C39] flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-900">Peak Operation Times</h3>
            <span className="text-[10px] text-zinc-400 font-medium">
              Minute-level traffic & ticket volume curve
            </span>
          </div>
        </div>

        {/* Minute Duration Selector Tabs */}
        <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80">
          {[
            { label: '15 Min', value: 15 },
            { label: '30 Min', value: 30 },
            { label: '1 Hour', value: 60 }
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setMinuteInterval(tab.value)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                minuteInterval === tab.value
                  ? 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Box Model for Peak and Lowest Times */}
      <div className="flex items-center space-x-2 mb-3">
        {/* Peak Box */}
        <div className="flex-1 px-3 py-1.5 bg-white border border-zinc-200/80 rounded-xl shadow-2xs">
          <span className="text-[10px] font-semibold text-zinc-500 block leading-tight">Peak Time</span>
          <span className="text-xs font-bold text-zinc-900 font-mono block leading-tight mt-0.5">
            {peakTimeLabel} <span className="text-[10px] font-medium text-zinc-400 font-sans">· {peakOrdersCount} orders</span>
          </span>
        </div>

        {/* Lowest Box */}
        <div className="flex-1 px-3 py-1.5 bg-white border border-zinc-200/80 rounded-xl shadow-2xs">
          <span className="text-[10px] font-semibold text-zinc-500 block leading-tight">Lowest Time</span>
          <span className="text-xs font-bold text-zinc-900 font-mono block leading-tight mt-0.5">
            {lowestTimeLabel} <span className="text-[10px] font-medium text-zinc-400 font-sans">· {lowestOrdersCount} orders</span>
          </span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">

          <AreaChart
            data={trends}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="orderCountGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF5C39" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#FF5C39" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F4F4F5" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#71717A' }}
              interval={minuteInterval === 15 ? 11 : minuteInterval === 30 ? 5 : 2}
            />
            <YAxis
              dataKey="orderCount"
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#71717A' }}
            />
            <Tooltip
              cursor={<CustomLineCursor />}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-md text-xs font-sans select-none">
                      <span className="font-bold text-zinc-900 block">{data.key || data.label}</span>
                      <div className="text-zinc-600 mt-1 space-y-0.5">
                        <div className="flex justify-between space-x-4">
                          <span className="text-zinc-400">Order Volume:</span>
                          <span className="font-bold text-[#FF5C39]">{data.orderCount} tickets</span>
                        </div>
                        <div className="flex justify-between space-x-4">
                          <span className="text-zinc-400">Revenue:</span>
                          <span className="font-bold text-zinc-800">{formatMMK(data.revenue)}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="orderCount"
              stroke="#FF5C39"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#orderCountGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// --- 4. Main Executive Dashboard Component ---

export default function DashboardPage() {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [summary, setSummary] = useState(null)
  const [menuItems, setMenuItems] = useState([])
  const [menuFilter, setMenuFilter] = useState('TOP') // 'TOP', 'BOTTOM'
  const [cashierBalances, setCashierBalances] = useState([])

  const loadDashboardData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true)
      const [sumData, menuData, cashierData] = await Promise.all([
        salesApi.getSummary(),
        salesApi.getMenuPerformance('DAILY'),
        salesApi.getCashierBalances()
      ])
      setSummary(sumData)
      setMenuItems(Array.isArray(menuData) ? menuData : [])
      setCashierBalances(Array.isArray(cashierData) ? cashierData : [])

      if (isManual) {
        setRefreshTrigger((prev) => prev + 1)
        addToast('Dashboard metrics refreshed', 'success')
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err)
      if (isManual) addToast('Failed to load dashboard metrics', 'warning')
    } finally {
      setLoading(false)
      if (isManual) setRefreshing(false)
    }
  }, [addToast])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  // 1. Calculate top seller volume to dynamically establish Dead Stock threshold (20% of top seller)
  const maxSalesCount = menuItems.reduce((max, item) => Math.max(max, item.quantitySold || 0), 0)
  const deadStockThreshold = maxSalesCount > 0 ? Math.floor(maxSalesCount * 0.20) : 0

  // 2. Filter & Sort Table Items
  const displayedTableItems = [...menuItems]
    .filter((item) => {
      if (menuFilter === 'TOP') {
        // Best Sellers: Active dishes with sales above dead stock threshold (or with sales > 0)
        return (item.quantitySold || 0) > deadStockThreshold || (deadStockThreshold === 0 && (item.quantitySold || 0) > 0)
      }
      // Dead Menu Items: Dishes with zero orders or volume <= 20% of top seller
      return (item.quantitySold || 0) <= deadStockThreshold
    })
    .sort((a, b) => {
      if (menuFilter === 'TOP') {
        return (b.quantitySold || 0) - (a.quantitySold || 0)
      }
      return (a.quantitySold || 0) - (b.quantitySold || 0)
    })

  // 3. Top 5 items for the Horizontal Chart Card
  const topChartItems = [...menuItems]
    .sort((a, b) => (b.quantitySold || 0) - (a.quantitySold || 0))
    .slice(0, 5)



  return (
    <div className="flex-1 flex flex-col min-h-0 select-none bg-[#ECEEF1]">
      {/* 1. Clean Page Header */}
      <AdminPageHeader title="Dashboard">
        <button
          type="button"
          onClick={() => loadDashboardData(true)}
          disabled={refreshing}
          className="h-8 px-3 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs font-bold text-zinc-700 shadow-2xs transition active:scale-[0.96] flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
          title="Refresh metrics"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </AdminPageHeader>

      {/* 2. Main Dashboard Workspace */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-4 flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-24 bg-white rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col items-center justify-center text-zinc-400">
            <span className="text-xs font-semibold">Loading store metrics...</span>
          </div>
        ) : (

          <>
            {/* Top Row: 3 KPI Cards (Title Case, Clean Typography) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Today Revenue */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-semibold text-zinc-500 block truncate">
                    Today Revenue
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-zinc-900 font-sans block mt-1 truncate">
                    {formatMMK(summary?.todayTotalRevenue || 0)}
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#FF5C39] flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* 2. Today Sales */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-semibold text-zinc-500 block truncate">
                    Today Sales
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-zinc-900 font-sans block mt-1 truncate">
                    {summary?.todayCompletedOrdersCount || 0}{' '}
                    <span className="text-xs font-medium text-zinc-400">orders</span>
                  </span>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              {/* 3. Today Highest Sales */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <span className="text-xs font-semibold text-zinc-500 block truncate">
                    Today Highest Sales
                  </span>
                  <span
                    className="text-base sm:text-lg font-bold text-zinc-900 block mt-1 truncate"
                    title={summary?.todayBestSellingItem?.name || 'No sales yet'}
                  >
                    {summary?.todayBestSellingItem?.name || 'No sales yet'}
                  </span>
                  {summary?.todayBestSellingItem && (
                    <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                      {formatNumber(summary.todayBestSellingItem.quantitySold)} sold
                    </span>
                  )}
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Middle Row: Charts Grid (Sales Trends + Peak Operation Times Curve) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SalesTrendChartCard refreshTrigger={refreshTrigger} />
              <PeakHoursCurveCard refreshTrigger={refreshTrigger} summary={summary} />
            </div>


            {/* Menu Performance Row: Chart and Table Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Left Card: Menu Performance Horizontal Bar Chart */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C39] flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900">Menu Performance Chart</h3>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Top ranking dishes by volume
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  {topChartItems.length === 0 ? (
                    <span className="text-xs text-zinc-400 font-medium">No menu sales recorded today.</span>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={topChartItems}
                        margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F4F4F5" />
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={{ stroke: '#E4E4E7' }}
                          tick={{ fontSize: 10, fill: '#71717A' }}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: '#27272A', fontWeight: 600 }}
                          width={110}
                        />
                        <Tooltip
                          cursor={<CustomHorizontalLineCursor />}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const item = payload[0].payload
                              return (
                                <div className="bg-white p-2.5 rounded-xl border border-zinc-200 shadow-md text-xs font-sans select-none">
                                  <span className="font-bold text-zinc-900 block">{item.name}</span>
                                  <span className="text-[10px] text-zinc-400 font-medium block">{item.categoryName}</span>
                                  <div className="text-zinc-600 mt-1 space-y-0.5">
                                    <div className="flex justify-between space-x-4">
                                      <span className="text-zinc-400">Sold:</span>
                                      <span className="font-bold text-[#FF5C39]">{item.quantitySold} units</span>
                                    </div>
                                    <div className="flex justify-between space-x-4">
                                      <span className="text-zinc-400">Revenue:</span>
                                      <span className="font-bold text-zinc-800">{formatMMK(item.totalRevenue)}</span>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar
                          dataKey="quantitySold"
                          fill="#FF5C39"
                          radius={[0, 4, 4, 0]}
                          maxBarSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Right Card: Menu Performance Table */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5C39] flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900">Menu Performance Table</h3>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Detailed breakdown by dish
                      </span>
                    </div>
                  </div>

                  {/* Toggle: Best Sellers vs Dead Menu Items */}
                  <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80">
                    <button
                      type="button"
                      onClick={() => setMenuFilter('TOP')}
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition flex items-center space-x-1 cursor-pointer ${
                        menuFilter === 'TOP'
                          ? 'bg-white text-emerald-600 shadow-2xs'
                          : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      <span>Best Sellers</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuFilter('BOTTOM')}
                      className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md transition flex items-center space-x-1 cursor-pointer ${
                        menuFilter === 'BOTTOM'
                          ? 'bg-white text-rose-600 shadow-2xs'
                          : 'text-zinc-400 hover:text-zinc-700'
                      }`}
                    >
                      <Archive className="w-3 h-3" />
                      <span>Dead Menu Items</span>
                    </button>
                  </div>
                </div>

                {/* Scrollable Table */}
                <div className="h-64 overflow-y-auto overflow-x-auto min-h-0">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-white z-10 shadow-2xs">
                      <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400">
                        <th className="py-2 px-1 bg-white">Item</th>
                        <th className="py-2 px-2 text-right bg-white">Price</th>
                        <th className="py-2 px-2 text-right bg-white">Qty Sold</th>
                        <th className="py-2 px-1 text-right bg-white">Total (MMK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100/70">

                      {displayedTableItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-zinc-400 font-medium">
                            {menuFilter === 'TOP'
                              ? 'No best-selling dishes recorded yet.'
                              : 'No dead menu items! All dishes had active sales.'}
                          </td>
                        </tr>
                      ) : (

                        displayedTableItems.map((item, idx) => (
                          <tr key={item.menuId || idx} className="hover:bg-zinc-50/60 transition">
                            <td className="py-2.5 px-1 font-semibold text-zinc-800">
                              <span className="block truncate max-w-[150px]">{item.name}</span>
                              <span className="text-[10px] text-zinc-400 font-normal">
                                {item.categoryName}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-zinc-500">
                              {formatMMK(item.unitPrice)}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-zinc-900">
                              {item.quantitySold}
                            </td>
                            <td className="py-2.5 px-1 text-right font-mono font-bold text-[#FF5C39]">
                              {formatMMK(item.totalRevenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Bottom Row: 50/50 Split (Left: Cashier Balances, Right: Financial Ledger) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Cashier Balances (Staff Drawer Reconciliation) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900">Cashier Balances</h3>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Staff drawer reconciliation
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto min-h-0">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[11px] font-bold text-zinc-400">
                        <th className="py-2 px-1">Cashier</th>
                        <th className="py-2 px-2 text-right">Orders</th>
                        <th className="py-2 px-1 text-right">Total (MMK)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100/70">
                      {cashierBalances.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-400 font-medium">
                            No cashier settlement records today.
                          </td>
                        </tr>
                      ) : (
                        cashierBalances.map((cashier) => (
                          <tr key={cashier.cashierId} className="hover:bg-zinc-50/60 transition">
                            <td className="py-2.5 px-1 font-semibold text-zinc-800">
                              <span className="block truncate max-w-[160px] font-bold">
                                {cashier.cashierName}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-normal">
                                {cashier.mobileNumber || `Staff #${cashier.cashierId}`}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-medium text-zinc-700">
                              {cashier.completedOrdersCount}
                            </td>
                            <td className="py-2.5 px-1 text-right font-mono font-bold text-zinc-900">
                              {formatMMK(cashier.totalRevenue)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Daily Financial Ledger */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-900">Daily Financial Ledger</h3>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Tax & revenue audit snapshot
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1 flex-1">
                  {/* Gross Revenue */}
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-semibold text-zinc-400 block">Gross Revenue</span>
                    <span className="text-sm sm:text-base font-bold text-zinc-900 font-mono block mt-0.5">
                      {formatMMK(summary?.todayGrossRevenue || summary?.todayTotalRevenue || 0)}
                    </span>
                  </div>

                  {/* 5% Fixed Commercial Tax */}
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-semibold text-zinc-400 block">Commercial Tax (5%)</span>
                    <span className="text-sm sm:text-base font-bold text-zinc-800 font-mono block mt-0.5">
                      {formatMMK(summary?.todayTaxAmount || 0)}
                    </span>
                  </div>

                  {/* Total Discounts */}
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-semibold text-zinc-400 block">Total Discounts</span>
                    <span className="text-sm sm:text-base font-bold text-zinc-800 font-mono block mt-0.5">
                      {formatMMK(summary?.todayDiscountAmount || 0)}
                    </span>
                  </div>

                  {/* Average Order Value */}
                  <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl flex flex-col justify-center">
                    <span className="text-[10px] font-semibold text-zinc-400 block">Avg Order Value</span>
                    <span className="text-sm sm:text-base font-bold text-[#FF5C39] font-mono block mt-0.5">

                      {formatMMK(
                        (summary?.todayCompletedOrdersCount || 0) > 0
                          ? Math.round((summary?.todayTotalRevenue || 0) / summary.todayCompletedOrdersCount)
                          : 0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>


          </>
        )}
      </div>
    </div>
  )
}




