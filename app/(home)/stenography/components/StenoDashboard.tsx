"use client";

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Target, 
  History, 
  Activity, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  data: {
    stats: {
      totalTests: number;
      avgAccuracy: number | string;
      bestAccuracy: number;
    };
    history: any[];
    graphData: any[];
  } | null;
}

export default function StenoDashboard({ data }: DashboardProps) {
  if (!data || data.stats.totalTests === 0) {
    return (
      <EmptyState />
    );
  }

  const { stats, history, graphData } = data;

  return (
    <div className="space-y-6">
      
      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Dictations</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTests}</h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <History className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Average Accuracy</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.avgAccuracy}%</h3>
              </div>
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <Activity className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Best Performance</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{stats.bestAccuracy}%</h3>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                <Trophy className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. PROGRESS CHART */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Accuracy Trend (Last 10)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6b7280' }} 
                  dy={10}
                />
                <YAxis 
                  domain={[80, 100]} 
                  hide={true} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  itemStyle={{ color: '#1f2937' }}
                //   formatter={(value: number) => [`${value}%`, "Accuracy"]}
                />
                <Area 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAccuracy)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 3. RECENT ACTIVITY LIST */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.slice(0, 5).map((attempt: any) => (
                <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="font-medium text-gray-900 truncate max-w-[150px]">
                      {attempt.steno_exercises?.title || "Unknown Exercise"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(attempt.created_at).toLocaleDateString()} • {attempt.steno_exercises?.wpm} WPM
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant={attempt.accuracy_percentage > 95 ? "default" : attempt.accuracy_percentage > 85 ? "secondary" : "destructive"}>
                      {attempt.accuracy_percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
              
              <Link href="/steno/history" className="block mt-4">
                <Button variant="outline" className="w-full text-sm">
                  View Full History <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Fallback if user has no data
function EmptyState() {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
      <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Target className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">No Attempts Yet</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Start your first dictation practice to see your analytics and progress graph here.
      </p>
      <Link href="/steno">
        <Button>Start Practicing</Button>
      </Link>
    </div>
  );
}