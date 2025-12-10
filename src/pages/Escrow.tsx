import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { PaymentModal } from '@/components/PaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import { mockEscrows, mockContracts, mockProperties } from '@/data/mockData';
import { Escrow as EscrowType } from '@/types';
import {
  Wallet,
  Shield,
  Building2,
  Calendar,
  CreditCard,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Ban,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Escrow() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [escrows, setEscrows] = useState<EscrowType[]>(mockEscrows);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<{
    id: string;
    amount: number;
    propertyTitle: string;
  } | null>(null);

  // Get escrows for current user
  const userEscrows = escrows.filter(
    (e) =>
      (user?.role === 'tenant' && e.tenantIc === user.ic) ||
      (user?.role === 'landlord' && e.landlordIc === user.ic)
  );

  // Get contracts that need payment (for tenants)
  const contractsNeedingPayment = mockContracts.filter(
    (c) =>
      user?.role === 'tenant' &&
      c.tenantIc === user.ic &&
      c.status === 'active' &&
      !escrows.some((e) => e.contractId === c.id)
  );

  const getContractProperty = (contractId: string) => {
    const contract = mockContracts.find((c) => c.id === contractId);
    if (!contract) return null;
    return mockProperties.find((p) => p.id === contract.propertyId);
  };

  const getContract = (contractId: string) => {
    return mockContracts.find((c) => c.id === contractId);
  };

  const handlePayDeposit = (contractId: string, amount: number, propertyTitle: string) => {
    setSelectedContract({ id: contractId, amount, propertyTitle });
    setPaymentModalOpen(true);
  };

  const handlePaymentComplete = (method: 'fpx' | 'duitnow') => {
    if (selectedContract) {
      const newEscrow: EscrowType = {
        id: `escrow-${Date.now()}`,
        contractId: selectedContract.id,
        tenantIc: user!.ic,
        landlordIc: getContract(selectedContract.id)!.landlordIc,
        amount: selectedContract.amount,
        status: 'secured',
        paymentMethod: method,
        paidAt: new Date().toISOString().split('T')[0],
      };
      setEscrows([...escrows, newEscrow]);
      toast({
        title: 'Deposit Secured',
        description: `Your deposit of RM ${selectedContract.amount.toLocaleString()} is now secured in escrow.`,
      });
    }
    setSelectedContract(null);
  };

  const handleRequestRelease = (escrowId: string) => {
    setEscrows(
      escrows.map((e) =>
        e.id === escrowId ? { ...e, status: 'release_requested' } : e
      )
    );
    toast({
      title: 'Release Requested',
      description: 'Your request has been sent to the landlord for approval.',
    });
  };

  const handleApproveRelease = (escrowId: string) => {
    setEscrows(
      escrows.map((e) =>
        e.id === escrowId
          ? { ...e, status: 'released', releasedAt: new Date().toISOString().split('T')[0] }
          : e
      )
    );
    toast({
      title: 'Deposit Released',
      description: 'The deposit has been released to the tenant.',
    });
  };

  const handleRejectRelease = (escrowId: string) => {
    setEscrows(
      escrows.map((e) => (e.id === escrowId ? { ...e, status: 'disputed' } : e))
    );
    toast({
      title: 'Release Rejected',
      description: 'A dispute has been opened for this escrow.',
      variant: 'destructive',
    });
  };

  const getStatusIcon = (status: EscrowType['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'secured':
        return <Shield className="h-5 w-5 text-emerald-500" />;
      case 'release_requested':
        return <ArrowUpRight className="h-5 w-5 text-blue-500" />;
      case 'released':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'disputed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Escrow Management</h1>
          <p className="text-muted-foreground">
            {user?.role === 'tenant'
              ? 'Manage your rental deposits and payment status'
              : 'View and manage tenant deposit escrows'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funds Secured</p>
                  <p className="text-2xl font-bold">
                    RM{' '}
                    {userEscrows
                      .filter((e) => e.status === 'secured')
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Release</p>
                  <p className="text-2xl font-bold">
                    RM{' '}
                    {userEscrows
                      .filter((e) => e.status === 'release_requested')
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Released</p>
                  <p className="text-2xl font-bold">
                    RM{' '}
                    {userEscrows
                      .filter((e) => e.status === 'released')
                      .reduce((sum, e) => sum + e.amount, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contracts Needing Payment (Tenant Only) */}
        {user?.role === 'tenant' && contractsNeedingPayment.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <CreditCard className="h-5 w-5" />
                Pending Deposit Payments
              </CardTitle>
              <CardDescription>
                These contracts require deposit payment to secure your rental
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contractsNeedingPayment.map((contract) => {
                const property = mockProperties.find((p) => p.id === contract.propertyId);
                return (
                  <div
                    key={contract.id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{property?.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Deposit: RM {contract.depositAmount.toLocaleString()} (2 months)
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() =>
                        handlePayDeposit(
                          contract.id,
                          contract.depositAmount,
                          property?.title || ''
                        )
                      }
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay Now
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Escrow List */}
        <Card>
          <CardHeader>
            <CardTitle>Escrow Records</CardTitle>
            <CardDescription>
              All your escrow transactions and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userEscrows.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Escrow Records</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.role === 'tenant'
                    ? 'Your escrow records will appear here once you make a deposit payment.'
                    : 'Tenant deposit records will appear here.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userEscrows.map((escrow) => {
                  const property = getContractProperty(escrow.contractId);

                  return (
                    <div
                      key={escrow.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                    >
                      <div className="flex items-start gap-4">
                        {getStatusIcon(escrow.status)}
                        <div>
                          <h4 className="font-semibold">{property?.title || 'Property'}</h4>
                          <p className="text-sm text-muted-foreground">
                            {property?.location}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="outline" className="capitalize">
                              {escrow.paymentMethod}
                            </Badge>
                            {escrow.paidAt && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Paid: {escrow.paidAt}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <p className="text-lg font-bold">
                          RM {escrow.amount.toLocaleString()}
                        </p>
                        <StatusBadge
                          status={escrow.status}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-2">
                          {user?.role === 'tenant' && escrow.status === 'secured' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRequestRelease(escrow.id)}
                            >
                              <ArrowUpRight className="mr-1 h-4 w-4" />
                              Request Release
                            </Button>
                          )}

                          {user?.role === 'landlord' &&
                            escrow.status === 'release_requested' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => handleApproveRelease(escrow.id)}
                                >
                                  <CheckCircle2 className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectRelease(escrow.id)}
                                >
                                  <Ban className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">RentSafe Escrow Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Your deposit is securely held in escrow until the end of your tenancy. Funds
                  can only be released when both tenant and landlord agree, or through our
                  dispute resolution process. This protects both parties and ensures fair
                  handling of deposits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      {selectedContract && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          amount={selectedContract.amount}
          propertyTitle={selectedContract.propertyTitle}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </DashboardLayout>
  );
}
