import { cn } from '@/utils/cn';

interface PasswordStrengthProps {
  password: string;
}

function getStrength(
  password: string
): { score: number; label: string; color: string } {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { score, label: 'Weak', color: 'bg-red-500' };
  }

  if (score <= 2) {
    return { score, label: 'Fair', color: 'bg-orange-500' };
  }

  if (score <= 3) {
    return { score, label: 'Good', color: 'bg-yellow-500' };
  }

  if (score <= 4) {
    return { score, label: 'Strong', color: 'bg-blue-500' };
  }

  return { score, label: 'Very Strong', color: 'bg-green-500' };
}

export function PasswordStrength({
  password,
}: PasswordStrengthProps) {
  if (!password) return null;

  const { score, label, color } = getStrength(password);
  const percentage = (score / 5) * 100;

  return (
    <div className="mt-1">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Password strength
        </span>

        <span
          className={cn(
            'text-xs font-medium',
            score <= 1 && 'text-red-500',
            score === 2 && 'text-orange-500',
            score === 3 && 'text-yellow-500',
            score === 4 && 'text-blue-500',
            score >= 5 && 'text-green-500'
          )}
        >
          {label}
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}