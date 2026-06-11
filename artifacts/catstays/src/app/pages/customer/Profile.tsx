import { useNavigate } from 'react-router';
import { CustomerProfileView } from './CustomerProfileView';

export function CustomerProfile() {
  const navigate = useNavigate();

  return (
    <CustomerProfileView onBack={() => navigate('/customer')} />
  );
}
