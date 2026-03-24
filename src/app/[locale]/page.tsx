import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { PainPoints } from "@/components/sections/PainPoints";
import { Differentiator } from "@/components/sections/Differentiator";
import { Testimonials } from "@/components/sections/Testimonials";
import { ProjectsShowcase } from "@/components/sections/ProjectsShowcase";
import { Process } from "@/components/sections/Process";
import { Automation } from "@/components/sections/Automation";
import { Services } from "@/components/sections/Services";
import { Coaching } from "@/components/sections/Coaching";
import { RiskReversal } from "@/components/sections/RiskReversal";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/sections/Footer";
import { WhatsAppFloat } from "@/components/ui/WhatsAppFloat";

export default function HomePage() {
  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <PainPoints />
      <Differentiator />
      <Testimonials />
      <ProjectsShowcase />
      <Process />
      <Automation />
      <Services />
      <Coaching />
      <RiskReversal />
      <FinalCta />
      <Footer />
      <WhatsAppFloat />
    </main>
  );
}
