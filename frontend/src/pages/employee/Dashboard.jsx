function Dashboard({ user }) {
  return <div className="p-4"><h1 className="text-xl font-bold">Tableau de bord — {user.name}</h1></div>;
}
export default Dashboard;