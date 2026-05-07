/**
 * CheckoutStepper Component
 *
 * Visual stepper for checkout flow
 */

'use client'

type CheckoutStep = 'shipping' | 'payment' | 'review' | 'confirmation'

interface CheckoutStepperProps {
  currentStep: CheckoutStep
  onStepClick?: (step: CheckoutStep) => void
  completedSteps?: CheckoutStep[]
}

const STEPS: { key: CheckoutStep; label: string; icon: string }[] = [
  { key: 'shipping', label: 'Envio', icon: 'bi-truck' },
  { key: 'payment', label: 'Pago', icon: 'bi-credit-card' },
  { key: 'review', label: 'Revisar', icon: 'bi-clipboard-check' },
  { key: 'confirmation', label: 'Confirmacion', icon: 'bi-check-circle' },
]

export function CheckoutStepper({
  currentStep,
  onStepClick,
  completedSteps = [],
}: CheckoutStepperProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep)

  const getStepState = (step: CheckoutStep, index: number) => {
    if (completedSteps.includes(step)) return 'completed'
    if (step === currentStep) return 'current'
    if (index < currentIndex) return 'completed'
    return 'pending'
  }

  const canClick = (step: CheckoutStep, index: number) => {
    if (!onStepClick) return false
    // Can only go back, not forward
    return index < currentIndex || completedSteps.includes(step)
  }

  return (
    <div className="checkout-stepper mb-4">
      <div className="d-flex justify-content-between position-relative">
        {/* Progress line */}
        <div
          className="position-absolute"
          style={{
            top: '20px',
            left: '40px',
            right: '40px',
            height: '2px',
            backgroundColor: '#e9ecef',
            zIndex: 0,
          }}
        >
          <div
            className="bg-primary h-100"
            style={{
              width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        {STEPS.map((step, index) => {
          const state = getStepState(step.key, index)
          const clickable = canClick(step.key, index)

          return (
            <div
              key={step.key}
              className="text-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <button
                type="button"
                className={`btn rounded-circle p-0 mb-2 ${
                  state === 'completed'
                    ? 'btn-success'
                    : state === 'current'
                    ? 'btn-primary'
                    : 'btn-light border'
                }`}
                style={{ width: '40px', height: '40px' }}
                onClick={() => clickable && onStepClick?.(step.key)}
                disabled={!clickable}
              >
                {state === 'completed' ? (
                  <i className="bi bi-check text-white" />
                ) : (
                  <i
                    className={`bi ${step.icon} ${
                      state === 'current' ? 'text-white' : 'text-muted'
                    }`}
                  />
                )}
              </button>
              <div
                className={`small ${
                  state === 'current'
                    ? 'fw-bold text-primary'
                    : state === 'completed'
                    ? 'text-success'
                    : 'text-muted'
                }`}
              >
                {step.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CheckoutStepper
