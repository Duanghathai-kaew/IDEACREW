import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HeroSearch() {
  return (
    <section className="bg-orange-50 py-16">
      <div className="mx-auto max-w-3xl text-center space-y-6">
        <h1 className="text-4xl font-bold text-orange-500">IDEACREW</h1>
        <p className="text-gray-600">Build Your Dream Team</p>
        <div className="flex gap-2">
          <Input placeholder="ค้นหาโปรเจกต์ ทักษะ หรือทีมที่ต้องการ..." />
          <Button className="bg-orange-500 hover:bg-orange-600">ค้นหา</Button>
        </div>
      </div>
    </section>
  );
}
