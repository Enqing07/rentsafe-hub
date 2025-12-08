import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { mockProperties, mockContracts } from '@/data/mockData';
import {
  FileText,
  Check,
  X,
  Shield,
  Calendar,
  DollarSign,
  Building2,
  PenTool,
  Image,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Contracts() {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'sign' | 'approve_photos' | 'reject_photos' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isLandlord = user?.role === 'landlord';

  // Filter contracts based on role
  const contracts = isLandlord
    ? mockContracts.filter((c) => c.landlordIc === '800515-01-5678')
    : mockContracts.filter((c) => c.tenantIc === user?.ic);

  const handleAction = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    if (actionType === 'sign') {
      toast.success('Contract signed successfully!', {
        description: 'Your digital signature has been embedded.',
      });
    } else if (actionType === 'approve_photos') {
      toast.success('Photos approved!', {
        description: 'You can now proceed to sign the contract.',
      });
    } else if (actionType === 'reject_photos') {
      toast.info('Photos rejected', {
        description: 'The landlord will be notified to re-upload photos.',
      });
    }
    
    setSelectedContract(null);
    setActionType(null);
  };

  const getContractStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending_photos: 'Waiting for Photos',
      pending_tenant_approval: 'Photos Pending Approval',
      pending_signatures: 'Awaiting Signatures',
      fully_signed: 'Fully Signed',
      active: 'Active',
      completed: 'Completed',
    };
    return labels[status] || status;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Contracts
          </h1>
          <p className="text-muted-foreground">
            View and manage your rental contracts
          </p>
        </div>

        {contracts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-full bg-muted p-4 mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No Contracts Yet</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                Contracts will appear here once an application is approved.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {contracts.map((contract) => {
              const property = mockProperties.find((p) => p.id === contract.propertyId);
              
              return (
                <Card key={contract.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img
                            src={property?.photos[0] || '/placeholder.svg'}
                            alt={property?.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{property?.title}</h3>
                            <Badge variant="outline">{getContractStatusLabel(contract.status)}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building2 className="h-4 w-4" />
                              {property?.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              RM {contract.monthlyRent.toLocaleString()}/mo
                            </span>
                          </div>
                          
                          {/* Signature Status */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <PenTool className="h-4 w-4" />
                              Tenant:
                              {contract.tenantSigned ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <PenTool className="h-4 w-4" />
                              Landlord:
                              {contract.landlordSigned ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Image className="h-4 w-4" />
                              Photos:
                              {contract.photosApproved ? (
                                <Check className="h-4 w-4 text-success" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 lg:items-end">
                        {!isLandlord && !contract.photosApproved && contract.status === 'pending_tenant_approval' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedContract(contract.id);
                                setActionType('reject_photos');
                              }}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject Photos
                            </Button>
                            <Button
                              variant="accent"
                              size="sm"
                              onClick={() => {
                                setSelectedContract(contract.id);
                                setActionType('approve_photos');
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve Photos
                            </Button>
                          </div>
                        )}
                        
                        {contract.photosApproved && !contract.tenantSigned && !isLandlord && (
                          <Button
                            variant="mydigital-id"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract.id);
                              setActionType('sign');
                            }}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Sign with MyDigital ID
                          </Button>
                        )}
                        
                        {contract.photosApproved && contract.tenantSigned && !contract.landlordSigned && isLandlord && (
                          <Button
                            variant="mydigital-id"
                            size="sm"
                            onClick={() => {
                              setSelectedContract(contract.id);
                              setActionType('sign');
                            }}
                          >
                            <Shield className="h-4 w-4 mr-1" />
                            Sign with MyDigital ID
                          </Button>
                        )}
                        
                        {contract.status === 'active' && (
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-1" />
                            View Contract
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Action Dialog */}
        <Dialog open={!!selectedContract} onOpenChange={() => {
          setSelectedContract(null);
          setActionType(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {actionType === 'sign' && (
                  <>
                    <Shield className="h-5 w-5 text-primary" />
                    Sign Contract with MyDigital ID
                  </>
                )}
                {actionType === 'approve_photos' && (
                  <>
                    <Check className="h-5 w-5 text-success" />
                    Approve Property Photos
                  </>
                )}
                {actionType === 'reject_photos' && (
                  <>
                    <X className="h-5 w-5 text-destructive" />
                    Reject Property Photos
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'sign' && (
                  'Your digital signature will be embedded with your name, IC number, timestamp, and document hash.'
                )}
                {actionType === 'approve_photos' && (
                  'By approving, you confirm that the property photos accurately represent the rental unit.'
                )}
                {actionType === 'reject_photos' && (
                  'The landlord will be notified to upload new photos. Please provide a reason for rejection.'
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSelectedContract(null);
                setActionType(null);
              }}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'reject_photos' ? 'destructive' : 'accent'}
                onClick={handleAction}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  'Confirm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
