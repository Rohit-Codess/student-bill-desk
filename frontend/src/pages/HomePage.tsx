import { Link } from 'react-router-dom';

const HomePage = () => {
  const features = [
    {
      title: 'Student Management',
      description: 'Add, edit, and manage student records with ease',
      icon: '👥',
      link: '/students',
      color: 'bg-blue-500'
    },
    {
      title: 'Fee Types',
      description: 'Configure different types of fees and amounts',
      icon: '💰',
      link: '/fee-types',
      color: 'bg-green-500'
    },
    {
      title: 'Generate Fees',
      description: 'Automatically generate monthly fee assignments',
      icon: '⚡',
      link: '/generate-fees',
      color: 'bg-purple-500'
    },
    {
      title: 'Fee Assignments',
      description: 'Track and manage payment status',
      icon: '📊',
      link: '/assignments',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl text-black p-8 text-center ">
        <h1 className="text-2xl font-bold mb-4">Welcome to Student Bill Desk 🧑‍💻</h1>
        <p className="text-sm opacity-90 mb-6">
          Comprehensive fee management system for educational institutions
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.link}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 group"
          >
            <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {feature.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm">{feature.description}</p>
          </Link>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">∞</div>
            <div className="text-gray-600">Students</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">∞</div>
            <div className="text-gray-600">Fee Types</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">∞</div>
            <div className="text-gray-600">Assignments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
