import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockProperties, mockApplications, mockContracts, mockEscrows } from '@/data/mockData';
import { Building2, Users, FileText, Wallet, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filter data for this landlord (using mock data)
  const myProperties = mockProperties.filter((p) => p.landlordIc === '800515-01-5678');
  const pendingApplications = mockApplications.filter(
    (app) => app.landlordIc === '800515-01-5678' && app.status === 'pending'
  );
  const activeContracts = mockContracts.filter(
    (c) => c.landlordIc === '800515-01-5678' && c.status === 'active'
  );
  const securedEscrows = mockEscrows.filter(
    (e) => e.landlordIc === '800515-01-5678' && e.status === 'secured'
  );

  const totalEscrowAmount = securedEscrows.reduce((sum, e) => sum + e.amount, 0);
  const monthlyIncome = activeContracts.reduce((sum, c) => sum + c.monthlyRent, 0);

  const stats = [
    {
      label: 'Active Properties',
      value: myProperties.filter((p) => p.available).length,
      total: myProperties.length,
      icon: Building2,
      href: '/properties',
      color: 'text-primary',
    },
    {
      label: 'Pending Applications',
      value: pendingApplications.length,
      icon: Users,
      href: '/applications',
      color: 'text-warning',
    },
    {
      label: 'Active Contracts',
      value: activeContracts.length,
      icon: FileText,
      href: '/contracts',
      color: 'text-info',
    },
    {
      label: 'Escrow Held',
      value: `RM ${totalEscrowAmount.toLocaleString()}`,
      icon: Wallet,
      href: '/escrow',
      color: 'text-success',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Landlord Dashboard</h1>
            <p className="text-muted-foreground">Manage your properties and tenants.</p>
          </div>
          <Button variant="accent" onClick={() => navigate('/properties/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Button>
        </div>

        {/* Income Overview */}
        <Card className="border-accent/20 bg-gradient-to-r from-accent/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Rental Income
                </p>
                <p className="text-4xl font-bold mt-1">RM {monthlyIncome.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  From {activeContracts.length} active rental{activeContracts.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="hidden sm:block">
                <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center">
                  <Wallet className="h-10 w-10 text-accent" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card
              key={stat.label}
              className="group cursor-pointer transition-all hover:shadow-card-hover hover:-translate-y-1"
            >
              <Link to={stat.href}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`rounded-full bg-muted p-2 ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Pending Applications */}
        {pendingApplications.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Pending Applications</h2>
              <Button variant="ghost" asChild>
                <Link to="/applications">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-4">
              {pendingApplications.map((app) => {
                const property = mockProperties.find((p) => p.id === app.propertyId);
                return (
                  <Card key={app.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={property?.photos[0] || '/placeholder.svg'}
                            alt={property?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium">{property?.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applicant: {app.tenantName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Applied: {new Date(app.appliedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={app.status} />
                        <Button size="sm" onClick={() => navigate(`/applications/${app.id}`)}>
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* My Properties */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">My Properties</h2>
            <Button variant="ghost" asChild>
              <Link to="/properties">
                Manage All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {myProperties.slice(0, 3).map((property) => (
              <Card key={property.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={property.photos[0] || '/placeholder.svg'}
                        alt={property.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium">{property.title}</h3>
                      <p className="text-sm text-muted-foreground">{property.location}</p>
                      <p className="text-sm font-medium text-accent">
                        RM {property.price.toLocaleString()}/mo
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={property.available ? 'active' : 'completed'} />
                    <Button variant="outline" size="sm" onClick={() => navigate(`/properties/${property.id}`)}>
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
