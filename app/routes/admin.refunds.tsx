import RefundList from '../components/RefundList';

const AdminRefundsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Gestion des Remboursements</h1>
      <RefundList />
    </div>
  );
};

export default AdminRefundsPage;
