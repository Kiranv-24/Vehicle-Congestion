import TrafficVisualization from '@/components/TrafficVisualization';

console.log('Index page loading...');

const Index = () => {
  console.log('Index component rendering...');
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <TrafficVisualization />
      </div>
    </div>
  );
};

export default Index;
