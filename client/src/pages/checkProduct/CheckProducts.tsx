import { CheckForm } from '@/features/check_impulse/ui/CheckForm';
import { Link } from 'react-router-dom';

export const CheckProductPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-md mt-10">
        <CheckForm />
        
        <div className="mt-6 text-center">
           <Link to="/profile" className="text-gray-500 text-sm hover:underline">
             Перейти в Личный кабинет
           </Link>
        </div>
      </div>
    </div>
  );
};