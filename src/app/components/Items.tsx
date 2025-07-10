import Container from "./Container";
import Chinese from "./categories/Chinese";
import Indian from "./categories/Indian";
import SouthIndian from "./categories/SouthIndian";
import Tandoor from "./categories/Tandoor";

function Items() {
  return (
    <div className="relative  bg-[#f9f9f9]">
      <Container>
        <div className="text-center ">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Our Menu
          </h2>
        </div>

        <Indian />
        <Chinese />
        <SouthIndian />
        <Tandoor />
      </Container>
    </div>
  );
}

export default Items;
