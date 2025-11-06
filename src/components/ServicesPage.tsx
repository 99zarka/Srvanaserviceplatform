import { Wrench, Droplet, Zap, Paintbrush, Hammer, Drill, Sparkles, Home } from "lucide-react";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface ServicesPageProps {
  onNavigate: (page: string) => void;
}

export function ServicesPage({ onNavigate }: ServicesPageProps) {
  const services = [
    {
      id: 1,
      title: "Carpentry",
      description: "Custom furniture, repairs, door and window installation, cabinet making, and general woodworking services.",
      icon: Hammer,
      workers: 450,
      avgRating: 4.8,
      startingPrice: "$50/hr",
    },
    {
      id: 2,
      title: "Plumbing",
      description: "Pipe repairs, installation, leak fixing, drain cleaning, bathroom and kitchen plumbing services.",
      icon: Droplet,
      workers: 380,
      avgRating: 4.9,
      startingPrice: "$60/hr",
    },
    {
      id: 3,
      title: "Electrical Work",
      description: "Wiring, lighting installation, electrical repairs, circuit breaker services, and safety inspections.",
      icon: Zap,
      workers: 320,
      avgRating: 4.7,
      startingPrice: "$65/hr",
    },
    {
      id: 4,
      title: "Painting",
      description: "Interior and exterior painting, wall finishing, color consultation, and decorative painting services.",
      icon: Paintbrush,
      workers: 520,
      avgRating: 4.8,
      startingPrice: "$40/hr",
    },
    {
      id: 5,
      title: "General Handyman",
      description: "Minor repairs, maintenance, assembly, mounting, and various odd jobs around the home.",
      icon: Wrench,
      workers: 680,
      avgRating: 4.6,
      startingPrice: "$45/hr",
    },
    {
      id: 6,
      title: "Drilling & Installation",
      description: "Wall drilling, mounting TVs and shelves, fixture installation, and precision drilling work.",
      icon: Drill,
      workers: 290,
      avgRating: 4.7,
      startingPrice: "$35/hr",
    },
    {
      id: 7,
      title: "Cleaning Services",
      description: "Deep cleaning, regular maintenance cleaning, post-construction cleanup, and specialized cleaning.",
      icon: Sparkles,
      workers: 840,
      avgRating: 4.9,
      startingPrice: "$30/hr",
    },
    {
      id: 8,
      title: "Home Renovation",
      description: "Complete room makeovers, kitchen and bathroom remodeling, structural changes, and upgrades.",
      icon: Home,
      workers: 210,
      avgRating: 4.8,
      startingPrice: "$80/hr",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-secondary text-secondary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="mb-6">Our Services</h1>
          <p className="max-w-3xl mx-auto text-secondary-foreground/90">
            Browse our wide range of professional home services. All workers are verified, 
            rated, and ready to help with your projects.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="hover:shadow-lg transition-all hover:border-primary group"
              >
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <service.icon className="h-8 w-8 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="mb-3">{service.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">
                      {service.workers} Workers
                    </Badge>
                    <Badge variant="secondary">
                      ⭐ {service.avgRating}
                    </Badge>
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent">
                      From {service.startingPrice}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => onNavigate("signup")}
                  >
                    Request Service
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">Can't Find What You Need?</h2>
          <p className="text-muted-foreground mb-8">
            Get in touch with us and we'll help you find the right professional for your specific needs.
          </p>
          <Button 
            size="lg"
            onClick={() => onNavigate("contact")}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}
