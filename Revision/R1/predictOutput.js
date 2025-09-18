var data = 50;

function outer() {
  console.log("Outer data:", data); 
  var data = 100;

  function inner() {
    console.log("Inner data:", data); 
    var data = 200;

    function deep() {
      console.log("Deep data:", data);
    }
    deep();
  }
  inner();
}

outer();


