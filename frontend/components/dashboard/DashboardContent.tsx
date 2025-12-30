'use client';

import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  UserPlus,
  FileText,
  Settings,
  RefreshCw,
  ChevronRight,
  Stethoscope,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DashboardContentProps {}

export const DashboardContent: FC<DashboardContentProps> = () => {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    return () => clearInterval(timer);
  }, []);

  // Stats data - Telecom colors
  const stats = [
    { 
      title: 'Total Appointments', 
      value: '1,234', 
      change: '+12.5%', 
      trend: 'up',
      icon: Calendar,
      gradient: 'from-cyan-500 to-teal-500',
      lightColor: 'bg-gradient-to-br from-cyan-50 to-teal-50',
      textColor: 'text-cyan-600'
    },
    { 
      title: 'Active Patients', 
      value: '567', 
      change: '+8.2%', 
      trend: 'up',
      icon: Users,
      gradient: 'from-teal-500 to-emerald-500',
      lightColor: 'bg-gradient-to-br from-teal-50 to-emerald-50',
      textColor: 'text-teal-600'
    },
    { 
      title: 'Total Revenue', 
      value: 'Rs. 4.5M', 
      change: '+15.3%', 
      trend: 'up',
      icon: DollarSign,
      gradient: 'from-blue-500 to-cyan-500',
      lightColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      textColor: 'text-blue-600'
    },
    { 
      title: 'Active Doctors', 
      value: '48', 
      change: '+3', 
      trend: 'up',
      icon: Stethoscope,
      gradient: 'from-indigo-500 to-blue-500',
      lightColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      textColor: 'text-indigo-600'
    },
  ];

  // Today's summary - Telecom colors
  const todaySummary = [
    { label: 'Appointments Today', value: 42, icon: Calendar, color: 'text-cyan-600', bg: 'bg-gradient-to-br from-cyan-50 to-teal-50' },
    { label: 'Completed', value: 28, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-gradient-to-br from-teal-50 to-emerald-50' },
    { label: 'Pending', value: 10, icon: Clock, color: 'text-blue-600', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50' },
    { label: 'Cancelled', value: 4, icon: XCircle, color: 'text-rose-600', bg: 'bg-gradient-to-br from-rose-50 to-pink-50' },
  ];

  // Quick actions - Telecom style with glass effect
  const quickActions = [
    { 
      label: 'New Appointment', 
      icon: Calendar, 
      href: '/dashboard/appointments', 
      gradient: 'from-cyan-500 to-teal-500',
      shadow: 'shadow-cyan-500/25'
    },
    { 
      label: 'Add Patient', 
      icon: UserPlus, 
      href: '/dashboard/customers', 
      gradient: 'from-teal-500 to-emerald-500',
      shadow: 'shadow-teal-500/25'
    },
    { 
      label: 'View Payments', 
      icon: CreditCard, 
      href: '/dashboard/payments', 
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/25'
    },
    { 
      label: 'Reports', 
      icon: FileText, 
      href: '/dashboard/reports', 
      gradient: 'from-indigo-500 to-blue-500',
      shadow: 'shadow-indigo-500/25'
    },
  ];

  // Recent activities
  const recentActivities = [
    { id: 1, action: 'New appointment booked', patient: 'John Silva', time: '5 min ago', type: 'success' },
    { id: 2, action: 'Payment received', patient: 'Sarah Fernando', time: '15 min ago', type: 'success' },
    { id: 3, action: 'Appointment cancelled', patient: 'Mike Perera', time: '1 hour ago', type: 'error' },
    { id: 4, action: 'New patient registered', patient: 'Anna Kumar', time: '2 hours ago', type: 'info' },
    { id: 5, action: 'Refund processed', patient: 'David Raj', time: '3 hours ago', type: 'warning' },
  ];

  // Recent patients data
  const recentPatients = [
    { id: 1, name: 'Kamal Perera', phone: '+94 77 123 4567', lastVisit: 'Today', status: 'Active', appointments: 5, avatar: 'KP' },
    { id: 2, name: 'Nimali Fernando', phone: '+94 76 234 5678', lastVisit: 'Yesterday', status: 'Active', appointments: 3, avatar: 'NF' },
    { id: 3, name: 'Ruwan Silva', phone: '+94 71 345 6789', lastVisit: '2 days ago', status: 'Pending', appointments: 1, avatar: 'RS' },
    { id: 4, name: 'Dilani Kumar', phone: '+94 78 456 7890', lastVisit: '3 days ago', status: 'Active', appointments: 8, avatar: 'DK' },
    { id: 5, name: 'Saman Jayawardena', phone: '+94 70 567 8901', lastVisit: 'Last week', status: 'Inactive', appointments: 2, avatar: 'SJ' },
  ];

  // Top doctors
  const topDoctors = [
    { name: 'Dr. Perera', specialty: 'Cardiologist', appointments: 156, rating: 4.9 },
    { name: 'Dr. Fernando', specialty: 'Dermatologist', appointments: 142, rating: 4.8 },
    { name: 'Dr. Silva', specialty: 'Orthopedic', appointments: 128, rating: 4.7 },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/20 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">{greeting}, Admin</h1>
            <p className="text-gray-500 mt-1">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300">
              <RefreshCw className="w-4 h-4 text-cyan-600" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2 border-teal-200 hover:bg-teal-50 hover:border-teal-300" onClick={() => router.push('/dashboard/settings')}>
              <Settings className="w-4 h-4 text-teal-600" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-xl ${stat.lightColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Summary & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's Summary */}
          <Card className="lg:col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Today's Summary</CardTitle>
              <CardDescription>Overview of today's appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {todaySummary.map((item, index) => (
                  <div key={index} className={`text-center p-4 ${item.bg} rounded-xl border border-white/50 hover:shadow-md transition-shadow`}>
                    <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
                    <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Telecom Glass Style */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-slate-50 to-cyan-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">Quick Actions</CardTitle>
              <CardDescription>Frequently used actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${action.gradient} text-white font-medium shadow-lg ${action.shadow} hover:shadow-xl hover:scale-[1.02] transition-all duration-200`}
                  onClick={() => router.push(action.href)}
                >
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <action.icon className="w-4 h-4" />
                  </div>
                  {action.label}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Top Doctors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Activity */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-1.5 rounded-full ${
                      activity.type === 'success' ? 'bg-emerald-100' :
                      activity.type === 'error' ? 'bg-red-100' :
                      activity.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      {activity.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                      {activity.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                      {activity.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                      {activity.type === 'info' && <Activity className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.patient}</p>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Doctors */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">Top Doctors</CardTitle>
                <CardDescription>This month's top performers</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => router.push('/dashboard/doctors')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDoctors.map((doctor, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {doctor.name.split(' ')[1]?.charAt(0) || 'D'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{doctor.name}</p>
                      <p className="text-xs text-gray-500">{doctor.specialty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{doctor.appointments}</p>
                      <p className="text-xs text-gray-500">appointments</p>
                    </div>
                    <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 hover:bg-cyan-50">
                      ⭐ {doctor.rating}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients Section */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardHeader className="pb-3 flex flex-row items-center justify-between bg-gradient-to-r from-cyan-50/50 to-teal-50/50">
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                Recent Patients
              </CardTitle>
              <CardDescription>Recently registered and active patients</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-cyan-200 text-cyan-700 hover:bg-cyan-50"
              onClick={() => router.push('/dashboard/customers')}
            >
              View All Patients <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-cyan-50/30">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Visit</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Appointments</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-cyan-50/30 transition-colors cursor-pointer">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                            {patient.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{patient.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{patient.phone}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{patient.lastVisit}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700">
                          <Calendar className="w-3.5 h-3.5" />
                          {patient.appointments}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={`font-normal ${
                            patient.status === 'Active' 
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0' 
                              : patient.status === 'Pending'
                                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white border-0'
                                : 'bg-gray-100 text-gray-600 border-0'
                          }`}
                        >
                          {patient.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Cards - Telecom Glass Style */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { title: 'Patients', icon: Users, count: 567, href: '/dashboard/customers', gradient: 'from-teal-500 to-cyan-500', shadow: 'hover:shadow-teal-500/20' },
            { title: 'Hospitals', icon: Building2, count: 12, href: '/dashboard/hospitals', gradient: 'from-cyan-500 to-blue-500', shadow: 'hover:shadow-cyan-500/20' },
            { title: 'Doctors', icon: Stethoscope, count: 48, href: '/dashboard/doctors', gradient: 'from-blue-500 to-indigo-500', shadow: 'hover:shadow-blue-500/20' },
            { title: 'Payments', icon: CreditCard, count: 234, href: '/dashboard/payments', gradient: 'from-indigo-500 to-violet-500', shadow: 'hover:shadow-indigo-500/20' },
            { title: 'Reports', icon: TrendingUp, count: 15, href: '/dashboard/reports', gradient: 'from-violet-500 to-purple-500', shadow: 'hover:shadow-violet-500/20' },
          ].map((item, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-sm hover:shadow-lg ${item.shadow} transition-all duration-300 cursor-pointer group overflow-hidden`}
              onClick={() => router.push(item.href)}
            >
              <CardContent className="p-5 relative">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${item.gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2`} />
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-500">{item.count} total</p>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};
