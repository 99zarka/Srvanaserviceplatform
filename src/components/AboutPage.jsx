import { CheckCircle, Users, Shield, Award } from "lucide-react";
import { Card, CardContent } from "./ui/card";

export function AboutPage() {
  const stats = [
    { label: "Active Users", value: "10,000+", icon: Users },
    { label: "Services Completed", value: "50,000+", icon: CheckCircle },
    { label: "Verified Workers", value: "2,500+", icon: Shield },
    { label: "Customer Satisfaction", value: "98%", icon: Award },
  ];

  const values = [
    {
      title: "Trust & Reliability",
      description: "All workers are verified and reviewed to ensure quality service",
      icon: Shield,
    },
    {
      title: "Quality Craftsmanship",
      description: "Connect with skilled professionals who take pride in their work",
      icon: Award,
    },
    {
      title: "Easy Connection",
      description: "Simple platform to find and hire the right professional for your needs",
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">About Srvana</h1>
          <p className="max-w-3xl mx-auto text-secondary-foreground/90">
            We're on a mission to bridge the gap between skilled workers and clients 
            who need quality home services. Srvana is more than a platform—it's a 
            community built on trust, quality, and mutual respect.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="mb-2">{stat.value}</div>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">Our Mission</h2>
              <p className="text-muted-foreground mb-4">
                At Srvana, we believe that finding reliable home service professionals 
                shouldn't be difficult or uncertain. Our platform connects homeowners and 
                businesses with skilled craftspeople who are passionate about their work.
              </p>
              <p className="text-muted-foreground mb-4">
                We carefully verify each worker on our platform, ensuring they have the 
                skills, experience, and professionalism that our clients deserve. Whether 
                you need a carpenter, plumber, electrician, or painter, Srvana makes it 
                easy to find the right person for the job.
              </p>
              <p className="text-muted-foreground">
                For workers, we provide a platform to showcase their skills, build their 
                reputation, and grow their business by connecting with clients who value 
                quality craftsmanship.
              </p>
            </div>
            <div className="grid gap-6">
              {values.map((value) => (
                <Card key={value.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                        <value.icon className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="mb-2">{value.title}</h3>
                        <p className="text-muted-foreground">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-6">Our Vision</h2>
          <p className="text-muted-foreground mb-6">
            We envision a world where quality home services are accessible to everyone, 
            and skilled workers have the tools they need to succeed. By creating a 
            transparent, trustworthy marketplace, we're building stronger communities 
            where craftsmanship is valued and rewarded.
          </p>
          <p className="text-muted-foreground">
            Join us in our mission to elevate the home services industry—one project at a time.
          </p>
        </div>
      </section>
    </div>
  );
}
