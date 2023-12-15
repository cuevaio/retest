const getDitto = async () => {
  let res = await fetch("https://pokeapi.co/api/v2/pokemon/ditto");
  let data = await res.json();
  return data;
};

export const Ditto = async () => {
  const { name, order } = await getDitto();
  return (
    <div className="bg-green-500">
      <h1>{name}</h1>
      <h2>{order}</h2>
    </div>
  );
};
