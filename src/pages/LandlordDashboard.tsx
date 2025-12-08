import { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockProperties, mockApplications, mockContracts, mockEscrows } from '@/data/mockData';
import { Building2, Users, FileText, Wallet, Plus, ArrowRight, Filter, Shield, Image } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function LandlordDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applicationFilter, setApplicationFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [contractFilter, setContractFilter] = useState<'all' | 'pending_photos' | 'pending_tenant_approval' | 'pending_signatures' | 'active'>('pending_signatures');

  // Filter data for this landlord (using mock data)
  const myProperties = mockProperties.filter((p) => p.landlordIc === '800515-01-5678');
  const landlordApplications = mockApplications.filter((app) => app.landlordIc === '800515-01-5678');
  const pendingApplications = landlordApplications.filter((app) => app.status === 'pending');
  const activeContracts = mockContracts.filter(
    (c) => c.landlordIc === '800515-01-5678' && c.status === 'active'
  );
  const reviewContracts = mockContracts.filter(
    (c) =>
      c.landlordIc === '800515-01-5678' &&
      (c.status === 'pending_signatures' || c.status === 'pending_photos' || c.status === 'pending_tenant_approval')
  );
  const securedEscrows = mockEscrows.filter(
    (e) => e.landlordIc === '800515-01-5678' && e.status === 'secured'
  );
  const escrowRequests = mockEscrows.filter((e) => e.landlordIc === '800515-01-5678');

  const totalEscrowAmount = securedEscrows.reduce((sum, e) => sum + e.amount, 0);
  const filteredApplications = landlordApplications.filter((app) =>
    applicationFilter === 'all' ? true : app.status === applicationFilter
  );
  const filteredContracts = reviewContracts.filter((contract) =>
    contractFilter === 'all' ? true : contract.status === contractFilter
  );

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

        {/* Active Listings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Rental Listings</h2>
            <Button variant="ghost" asChild>
              <Link to="/properties">
                Manage Listings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            {myProperties
              .filter((property) => property.available)
              .slice(0, 4)
              .map((property) => (
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
                      <Button variant="outline" size="sm" onClick={() => navigate(`/properties/${property.id}/edit`)}>
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>

        {/* Applications */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Tenant Applications</h2>
              {pendingApplications.length > 0 && <StatusBadge status="pending" className="hidden sm:inline-flex" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={applicationFilter === status ? 'accent' : 'ghost'}
                  onClick={() => setApplicationFilter(status)}
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No applications in this state.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((app) => {
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
                        <Button size="sm" onClick={() => navigate(`/applications/${app.id}/review`)}>
                          Review
                        </Button>
                        
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Contracts pending review */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Contracts</h2>
              {reviewContracts.some((c) => c.status === 'pending_signatures' || c.status === 'pending_photos' || c.status === 'pending_tenant_approval') && (
                <StatusBadge status="pending_signatures" className="hidden sm:inline-flex" />
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-4 w-4 text-muted-foreground" />
              {(['all', 'pending_photos', 'pending_tenant_approval', 'pending_signatures', 'active'] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={contractFilter === status ? 'accent' : 'ghost'}
                  onClick={() => setContractFilter(status)}
                >
                  {status === 'all' && 'All'}
                  {status === 'pending_photos' && 'Awaiting Photos'}
                  {status === 'pending_tenant_approval' && 'Pending Tenant Approval'}
                  {status === 'pending_signatures' && 'Awaiting Signatures'}
                  {status === 'active' && 'Active'}
                </Button>
              ))}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/contracts">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {filteredContracts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                No contracts match this filter.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredContracts.map((contract) => {
                const property = mockProperties.find((p) => p.id === contract.propertyId);
                return (
                  <Card key={contract.id}>
                    <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={property?.photos[0] || '/placeholder.svg'}
                            alt={property?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{property?.title}</h3>
                            <StatusBadge status={contract.status} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Tenant IC: {contract.tenantIc}
                          </p>
                          <p className="text-sm font-medium text-accent">
                            RM {contract.monthlyRent.toLocaleString()}/mo — Deposit RM {contract.depositAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {/* Awaiting Photos: Show View Contract and Upload Photos */}
                        {contract.status === 'pending_photos' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                              <FileText className="h-4 w-4 mr-1" />
                              View Contract
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}/upload-photos`)}>
                              <Image className="h-4 w-4 mr-1" />
                              Upload Photos
                            </Button>
                          </>
                        )}
                        {/* Pending Tenant Approval: Only show View Contract (landlord waits for tenant approval) */}
                        {contract.status === 'pending_tenant_approval' && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View Contract
                          </Button>
                        )}
                        {/* Awaiting Signatures: Only show View Contract (signing happens inside) */}
                        {contract.status === 'pending_signatures' && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View Contract
                          </Button>
                        )}
                        {/* Active: Show View Contract */}
                        {contract.status === 'active' && (
                          <Button variant="outline" size="sm" onClick={() => navigate(`/contracts/${contract.id}`)}>
                            <FileText className="h-4 w-4 mr-1" />
                            View Contract
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Escrow Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Escrow Statuses</h2>    
            <Button variant="ghost" asChild>
              <Link to="/escrow">
                View All
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>    
          </div>
          <div className="grid gap-4">
            {escrowRequests.map((escrow) => {
              const contract = mockContracts.find((c) => c.id === escrow.contractId);
              const property = mockProperties.find((p) => p.id === contract?.propertyId);
              return (
                <Card key={escrow.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={property?.photos[0] || '/placeholder.svg'}
                          alt={property?.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{property?.title}</h3>
                        <p className="text-sm text-muted-foreground">Deposit: RM {escrow.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground uppercase">via {escrow.paymentMethod}</p>
                      </div>
                    </div>
                    <StatusBadge status={escrow.status} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* My Properties removed per request */}
      </div>
    </DashboardLayout>
  );
}
