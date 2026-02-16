// frontend/src/app/applications/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createApplication, updateApplication, submitApplication } from '@/services/applications';
import { ErrorAlert, LoadingSpinner } from '@/components/common';
import type { Application } from '@/types';

const STEPS = ['Personal Info', 'Vehicle Details', 'Loan Details', 'Employment', 'Review & Submit'];

export default function NewApplicationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [application, setApplication] = useState<Application | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({ first_name: '', last_name: '', date_of_birth: '', ssn: '' });
  const [carDetails, setCarDetails] = useState({ make: '', model: '', year: '', vin: '' });
  const [loanDetails, setLoanDetails] = useState({ amount: '', term: '36', down_payment: '' });
  const [employmentInfo, setEmploymentInfo] = useState({ employer: '', position: '', monthly_income: '', years_employed: '' });

  if (authLoading) return <LoadingSpinner />;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleNext = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      if (currentStep === 0 && !application) {
        const newApp = await createApplication({
          personal_info: personalInfo,
          current_step: 1,
        });
        setApplication(newApp);
      } else if (application) {
        const stepData: Record<string, unknown> = {};
        if (currentStep === 0) stepData.personal_info = personalInfo;
        if (currentStep === 1) stepData.car_details = carDetails;
        if (currentStep === 2) stepData.loan_details = loanDetails;
        if (currentStep === 3) stepData.employment_info = employmentInfo;
        stepData.current_step = currentStep + 2;

        await updateApplication(application.id, stepData as Partial<Application>);
      }
      setCurrentStep((prev) => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!application) return;
    setError('');
    setIsSubmitting(true);

    try {
      await submitApplication(application.id);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">New Application</h1>

      {/* Stepper */}
      <div className="mb-8 flex justify-between">
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {i + 1}
            </div>
            <span className="mt-1 text-xs text-gray-500">{step}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4">
          <ErrorAlert message={error} onDismiss={() => setError('')} />
        </div>
      )}

      {/* Step Forms */}
      {currentStep === 0 && (
        <div className="space-y-4" data-testid="step-personal">
          <div>
            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
            <input id="first_name" type="text" value={personalInfo.first_name} onChange={(e) => setPersonalInfo({ ...personalInfo, first_name: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input id="last_name" type="text" value={personalInfo.last_name} onChange={(e) => setPersonalInfo({ ...personalInfo, last_name: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input id="dob" type="date" value={personalInfo.date_of_birth} onChange={(e) => setPersonalInfo({ ...personalInfo, date_of_birth: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="ssn" className="block text-sm font-medium text-gray-700">SSN</label>
            <input id="ssn" type="text" value={personalInfo.ssn} onChange={(e) => setPersonalInfo({ ...personalInfo, ssn: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-4" data-testid="step-vehicle">
          <div>
            <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make</label>
            <input id="make" type="text" value={carDetails.make} onChange={(e) => setCarDetails({ ...carDetails, make: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
            <input id="model" type="text" value={carDetails.model} onChange={(e) => setCarDetails({ ...carDetails, model: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
            <input id="year" type="text" value={carDetails.year} onChange={(e) => setCarDetails({ ...carDetails, year: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="vin" className="block text-sm font-medium text-gray-700">VIN</label>
            <input id="vin" type="text" value={carDetails.vin} onChange={(e) => setCarDetails({ ...carDetails, vin: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4" data-testid="step-loan">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Loan Amount</label>
            <input id="amount" type="number" value={loanDetails.amount} onChange={(e) => setLoanDetails({ ...loanDetails, amount: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700">Term (months)</label>
            <select id="term" value={loanDetails.term} onChange={(e) => setLoanDetails({ ...loanDetails, term: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2">
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
              <option value="72">72 months</option>
            </select>
          </div>
          <div>
            <label htmlFor="down_payment" className="block text-sm font-medium text-gray-700">Down Payment</label>
            <input id="down_payment" type="number" value={loanDetails.down_payment} onChange={(e) => setLoanDetails({ ...loanDetails, down_payment: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4" data-testid="step-employment">
          <div>
            <label htmlFor="employer" className="block text-sm font-medium text-gray-700">Employer</label>
            <input id="employer" type="text" value={employmentInfo.employer} onChange={(e) => setEmploymentInfo({ ...employmentInfo, employer: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
            <input id="position" type="text" value={employmentInfo.position} onChange={(e) => setEmploymentInfo({ ...employmentInfo, position: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="monthly_income" className="block text-sm font-medium text-gray-700">Monthly Income</label>
            <input id="monthly_income" type="number" value={employmentInfo.monthly_income} onChange={(e) => setEmploymentInfo({ ...employmentInfo, monthly_income: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label htmlFor="years_employed" className="block text-sm font-medium text-gray-700">Years Employed</label>
            <input id="years_employed" type="number" value={employmentInfo.years_employed} onChange={(e) => setEmploymentInfo({ ...employmentInfo, years_employed: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="rounded-lg border bg-white p-6" data-testid="step-review">
          <h2 className="mb-4 text-lg font-semibold">Review Your Application</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p><strong>Name:</strong> {personalInfo.first_name} {personalInfo.last_name}</p>
            <p><strong>Vehicle:</strong> {carDetails.year} {carDetails.make} {carDetails.model}</p>
            <p><strong>Loan Amount:</strong> ${loanDetails.amount}</p>
            <p><strong>Term:</strong> {loanDetails.term} months</p>
            <p><strong>Employer:</strong> {employmentInfo.employer}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {currentStep > 0 ? (
          <button onClick={handleBack} className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50">
            Back
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button onClick={handleNext} disabled={isSubmitting} className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Saving...' : 'Next'}
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting} className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50">
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        )}
      </div>
    </div>
  );
}
