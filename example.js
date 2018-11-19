jQuery(window).ready(() => {

    let elementChart01 = jQuery('#chart01');
    let chart01 = new PChart(elementChart01, '#7BBAE7');

    chart01.setColumns(['A', 'B', 'C', 'D', 'E']);
    chart01.setData([30, 100, 50, 20, 10], true, 120); // force
    chart01.play();


    let elementChart02 = jQuery('#chart02');
    let chart02 = new PChart(elementChart02, '#7977C2');

    chart02.setColumns(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    chart02.setData([1, 5, 2, 3, 8, 6, 4], true, 10); // force
    chart02.play();


    let elementChart03 = jQuery('#chart03');
    let chart03 = new PChart(elementChart03, '#FFBC05');

    chart03.setColumns(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O']);
    chart03.setData([1, 5, 2, 3, 8, 6, 4, 1, 5, 2, 3, 8, 6, 4, 2], true, 18); // force
    chart03.play();


    setInterval(() => {
        let data = [];

        for (var i=0 ; i<5 ; i++) data.push(Math.floor(Math.random() * 120));
        chart01.update(data);
    }, 1000)

    setInterval(() => {
        let data = [];

        for (var i=0 ; i<7 ; i++) data.push(Math.floor(Math.random() * 10));
        chart02.update(data);
    }, 1500)

    setInterval(() => {
        let data = [];

        for (var i=0 ; i<15 ; i++) data.push(Math.floor(Math.random() * 18));
        chart03.update(data);
    }, 3000)

});
