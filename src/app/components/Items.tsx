import Container from "./Container";
import ChineseServer from "./server-components/ChineseServer";
import IndianServer from "./server-components/IndianServer";
import SouthIndianServer from "./server-components/SouthIndianServer";
import TandoorServer from "./server-components/TandoorServer";

function Items() {
  return (
    <div className="relative  bg-[#f9f9f9]">
      <Container>
        <div className="text-center ">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Our Menu
          </h2>
        </div>
        <IndianServer />
        <ChineseServer />
        <SouthIndianServer />
        <TandoorServer />
      </Container>
    </div>
  );
}

export default Items;
