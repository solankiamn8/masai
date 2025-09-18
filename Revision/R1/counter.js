const obj = {
    name: "Counter",
    count: 0,
    start: function () {
      console.log(this.name + " started");
      for (let i = 0; i < 3; i++) {
        setTimeout( ()=>{
          this.count++;
          console.log(this.count);
        }, i * 500);
      }
    }
  };
  
  obj.start();
  
  