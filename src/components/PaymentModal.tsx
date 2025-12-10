import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle2, Building2, Smartphone, ArrowRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

type PaymentMethod = 'fpx' | 'duitnow';
type PaymentStep = 'select' | 'details' | 'processing' | 'success';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  propertyTitle?: string;
  onPaymentComplete: (method: PaymentMethod) => void;
}

const fpxBanks = [
  { id: 'maybank', name: 'Maybank2u', logo: '🏦' },
  { id: 'cimb', name: 'CIMB Clicks', logo: '🏦' },
  { id: 'public', name: 'PBe Bank', logo: '🏦' },
  { id: 'rhb', name: 'RHB Now', logo: '🏦' },
  { id: 'hong-leong', name: 'Hong Leong Connect', logo: '🏦' },
  { id: 'ambank', name: 'AmOnline', logo: '🏦' },
];

export function PaymentModal({
  open,
  onOpenChange,
  amount,
  propertyTitle,
  onPaymentComplete,
}: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('select');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [duitnowId, setDuitnowId] = useState('');

  const handleMethodSelect = (selectedMethod: PaymentMethod) => {
    setMethod(selectedMethod);
    setStep('details');
  };

  const handleProceedToPayment = () => {
    setStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setStep('success');
    }, 2500);
  };

  const handleComplete = () => {
    if (method) {
      onPaymentComplete(method);
    }
    // Reset state
    setStep('select');
    setMethod(null);
    setSelectedBank('');
    setDuitnowId('');
    onOpenChange(false);
  };

  const handleClose = () => {
    if (step !== 'processing') {
      setStep('select');
      setMethod(null);
      setSelectedBank('');
      setDuitnowId('');
      onOpenChange(false);
    }
  };

  const canProceed = method === 'fpx' ? !!selectedBank : duitnowId.length >= 10;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' && 'Select Payment Method'}
            {step === 'details' && (method === 'fpx' ? 'FPX Payment' : 'DuitNow QR')}
            {step === 'processing' && 'Processing Payment'}
            {step === 'success' && 'Payment Successful'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && `Pay RM ${amount.toLocaleString()} for ${propertyTitle || 'deposit'}`}
            {step === 'details' && 'Complete your payment details'}
            {step === 'processing' && 'Please wait while we process your payment...'}
            {step === 'success' && 'Your deposit has been secured in escrow'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step 1: Select Payment Method */}
          {step === 'select' && (
            <div className="space-y-4">
              <Card
                className={cn(
                  'cursor-pointer transition-all hover:border-primary',
                  method === 'fpx' && 'border-primary bg-primary/5'
                )}
                onClick={() => handleMethodSelect('fpx')}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">FPX Online Banking</h4>
                    <p className="text-sm text-muted-foreground">
                      Pay directly from your bank account
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              <Card
                className={cn(
                  'cursor-pointer transition-all hover:border-primary',
                  method === 'duitnow' && 'border-primary bg-primary/5'
                )}
                onClick={() => handleMethodSelect('duitnow')}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">DuitNow QR</h4>
                    <p className="text-sm text-muted-foreground">
                      Scan & pay with your banking app
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-2">
                <Shield className="h-4 w-4" />
                <span>Secured by RentSafe Escrow Protection</span>
              </div>
            </div>
          )}

          {/* Step 2: Payment Details */}
          {step === 'details' && method === 'fpx' && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">RM {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Fee</span>
                  <span className="text-emerald-600">Free</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-3 block">Select Your Bank</Label>
                <RadioGroup value={selectedBank} onValueChange={setSelectedBank}>
                  <div className="grid grid-cols-2 gap-2">
                    {fpxBanks.map((bank) => (
                      <Label
                        key={bank.id}
                        htmlFor={bank.id}
                        className={cn(
                          'flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all',
                          selectedBank === bank.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-muted-foreground/50'
                        )}
                      >
                        <RadioGroupItem value={bank.id} id={bank.id} className="sr-only" />
                        <span className="text-lg">{bank.logo}</span>
                        <span className="text-sm">{bank.name}</span>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <Button
                className="w-full"
                onClick={handleProceedToPayment}
                disabled={!canProceed}
              >
                Proceed to Bank
              </Button>
            </div>
          )}

          {step === 'details' && method === 'duitnow' && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">RM {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Fee</span>
                  <span className="text-emerald-600">Free</span>
                </div>
              </div>

              {/* Mock QR Code */}
              <div className="flex flex-col items-center py-4">
                <div className="h-40 w-40 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                  <div className="text-center">
                    <Smartphone className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <span className="text-xs text-muted-foreground">Mock QR Code</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Scan with your banking app</p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or enter DuitNow ID</span>
                </div>
              </div>

              <div>
                <Label htmlFor="duitnow-id" className="text-sm">Phone Number / NRIC</Label>
                <Input
                  id="duitnow-id"
                  placeholder="e.g., 0123456789"
                  value={duitnowId}
                  onChange={(e) => setDuitnowId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleProceedToPayment}
                disabled={!canProceed}
              >
                Confirm Payment
              </Button>
            </div>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Connecting to payment gateway...</p>
              <p className="text-xs text-muted-foreground mt-2">Do not close this window</p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="flex flex-col items-center py-6">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Payment Successful!</h3>
              <p className="text-muted-foreground text-sm text-center mb-4">
                Your deposit of RM {amount.toLocaleString()} has been secured in escrow.
              </p>
              <div className="w-full bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference No.</span>
                  <span className="font-mono">RS{Date.now().toString().slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="capitalize">{method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-emerald-600 font-medium">Funds Secured</span>
                </div>
              </div>
              <Button className="w-full mt-4" onClick={handleComplete}>
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
