import { ArrowRight, CheckCircle, Users, Wrench, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const services = [
    {
      title: "Carpentry",
      description: "Expert woodworking and furniture services",
      image: "https://images.unsplash.com/photo-1626081063434-79a2169791b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJwZW50ZXIlMjB3b29kJTIwd29ya2luZ3xlbnwxfHx8fDE3NjI0MzA2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Plumbing",
      description: "Professional plumbing repairs and installation",
      image: "https://images.unsplash.com/photo-1563197906-c1466d8e2edd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwbHVtYmVyJTIwZml4aW5nJTIwcGlwZXN8ZW58MXx8fHwxNzYyMzU5MDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Electrical",
      description: "Certified electrical work and maintenance",
      image: "https://images.unsplash.com/photo-1744113511604-235e7010981f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpY2lhbiUyMGVsZWN0cmljYWwlMjB3b3JrfGVufDF8fHx8MTc2MjQzMDYwNHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Painting",
      description: "Quality painting and finishing services",
      image: "https://images.unsplash.com/photo-1629941633816-a1d688cb2d1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWludGVyJTIwcGFpbnRpbmclMjB3YWxsfGVufDF8fHx8MTc2MjQxNDMzOHww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Choose a Service",
      description: "Select from our wide range of professional services",
    },
    {
      step: "2",
      title: "Find a Worker",
      description: "Browse verified professionals and check their ratings",
    },
    {
      step: "3",
      title: "Get it Done",
      description: "Schedule the service and get quality work delivered",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      content: "Found an amazing carpenter through Srvana. The quality of work exceeded my expectations!",
      rating: 5,
    },
    {
      name: "Mike Chen",
      role: "Property Manager",
      content: "Srvana has become my go-to platform for all maintenance needs. Reliable and professional.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Business Owner",
      content: "The electricians I hired were prompt, skilled, and very reasonably priced. Highly recommend!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-secondary to-secondary/90 text-secondary-foreground py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
                Trusted by 10,000+ Users
              </Badge>
              <h1 className="mb-6">
                Connect with Skilled Professionals for Every Home Service
              </h1>
              <p className="mb-8 text-secondary-foreground/90">
                Srvana makes it easy to find reliable workers for carpentry, plumbing, 
                electrical work, and more. Quality service, guaranteed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={() => onNavigate("services")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Find a Service
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onNavigate("signup")}
                  className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                >
                  Join as a Worker
                </Button>
              </div>
            </div>
            <div className="relative">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1581578949510-fa7315c4c350?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob21lJTIwc2VydmljZXMlMjBoYW5keW1hbnxlbnwxfHx8fDE3NjI0MzA2MDV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Professional worker"
                className="rounded-lg shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item) => (
              <Card key={item.step} className="border-2 hover:border-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground mb-4">
                    <span>{item.step}</span>
                  </div>
                  <h3 className="mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">Featured Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expert professionals ready to help with your home projects
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card 
                key={service.title} 
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => onNavigate("services")}
              >
                <div className="aspect-video overflow-hidden">
                  <ImageWithFallback
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="pt-4">
                  <h3 className="mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto mt-2 text-primary"
                  >
                    Learn More <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied clients and workers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p>{testimonial.name}</p>
                    <p className="text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary text-secondary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="mb-4">Ready to Get Started?</h2>
          <p className="mb-8 text-secondary-foreground/90">
            Whether you need a service or want to offer your skills, Srvana is here for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => onNavigate("services")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Browse Services
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate("signup")}
              className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
            >
              Become a Worker
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
