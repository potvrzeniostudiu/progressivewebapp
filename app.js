
if ('serviceWorker' in navigator) {
    try {
        navigator.serviceWorker.register('sw.js');
        console.log("Funguje");
    } catch (error) {
        console.log("Nefunguje");
    }
}

$(document).ready(function () {

    var server = "https://api.openweathermap.org/data/2.5/forecast?q="
    var owm_key = "&lang=cz&APPID=afb6e76426a0802ed7f8dcdb42900eab&units=metric"

    function dump() {
        $("#error_message").empty();
        $(".results .results_wrapper").children().empty();
        $(".top").empty();
        $("#results_table_detail").empty();
    }

    search_flag = false;

    var response_obtained = null;

    $('.vypln').submit(function (e) {
        searched_city = $('#mesto').val();
        e.preventDefault();
        
        hide();

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": server + searched_city + owm_key,
            "method": "GET",
            success: function(response){
                response_obtained = response; 

            },
            error: function (e) {
                dump();
                $("#error_message").append("Nenalezeno");
            }
        }


        $.ajax(settings).done(function (response) {
            dump();


            search_flag = true;

            localStorage.setItem(searched_city, JSON.stringify(response));

            //var getJSON_response = JSON.parse(localStorage.getItem(searched_city));
            
            var arr_temp = [];
            var arr_dates = [];
            var i;
            for (i = 0; i < 16; i++) {
                arr_temp.push(response.list[i].main.temp);
                let trimmed_date = (response.list[i].dt_txt).slice(11, -3);
                arr_dates.push(trimmed_date);
            } 

            var ctx = document.getElementById("myChart").getContext('2d');
            var myChart = new Chart(ctx, {
                type: 'line',
                height: 150,
                width: 400,
                data: {
                    labels: arr_dates,
                    datasets: [{
                        label: 'Teplota',
                        data: arr_temp,
                        backgroundColor: [
                            'rgba(255, 255, 255, 0.5)',
                            'rgba(0, 0, 0, 0.5)',
                            'rgba(150, 206, 86, 0.5)',
                            'rgba(75, 192, 192, 0.5)',
                            'rgba(150, 102, 255, 0.5)',
                            'rgba(150, 159, 64, 0.5)'
                        ],
                        borderColor: [
                            'rgba(150,99,132,1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 2
                    }]
                },
                options: {
                    legend: {
                        labels: {
                            fontColor: 'white'
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });


            //NASTAVENI     //.serializeArray    var div = $("<div></div>");   div.append("ahoj");

            $("#result_city").append(searched_city);
            
            //teplota
            if ($("#teplota_radio").is(":checked") === true) {
                let teplota = (response.list[0].main.temp).toString();
                $("#teplota").append(teplota + "°C").show('slow');
            }

            //vlhkost
            if ($("#vlhkost_radio").is(":checked") === true) {
                vlhkost = (response.list[0].main.humidity);
                $("#vlhkost").append(vlhkost);
            }

            //min. teplota
            if ($("#min_teplota_radio").is(":checked") === true) {
                min_temp = (response.list[0].main.temp_min);
                $("#min-temp").append(min_temp + "°C");
            }

            //max. teplota
            if ($("#max_teplota_radio").is(":checked") === true) {
                max_temp = (response.list[0].main.temp_max);
                $("#max-temp").append(max_temp + "°C");
            }

            //tlak
            if ($("#tlak_radio").is(":checked") === true) {
                tlak = (response.list[0].main.pressure);
                $("#tlak").append(tlak + "mBar");
            }

            //vitr
            if ($("#vitr_radio").is(":checked") === true) {
                vitr = (response.list[0].wind.speed);
                $("#vitr").append(vitr + "m/s");
            }


            for (i = 0; i < 16; i++) {
                    var table_date = response.list[i].dt_txt.slice(6,-3);
                $('body #results_table_detail').append(
                    '<tr><td>' + table_date + '</td>' +
                    '<td>' + response.list[i].main.temp + '°C</td>' +
                    '<td>' + response.list[i].wind.speed + ' m/s</td>' +
                    '<td>' + response.list[i].weather[0].description + '</td>' +
                    '</tr>');
                    
            }

        });
    });

    $("#map_button_open").click(function(){
        
        if(search_flag) {

            latitude = (response_obtained.city.coord.lat);
            longitude = (response_obtained.city.coord.lon);

            const options = {

                // Required: API key
                key: '6sZ6r5filmvn76tOGHe1sYXh140hwHiu',
            
                // Put additional console output
                verbose: true,
            
                // Optional: Initial state of the map
                lat: latitude,
                lon: longitude,
                zoom: 5,
            }
            
            // Initialize Windy API
            windyInit(options, windyAPI => {
                // windyAPI is ready, and contain 'map', 'store',
                // 'picker' and other usefull stuff
            
                const { map } = windyAPI
                // .map is instance of Leaflet map
            
                L.popup()
                    .setLatLng([latitude, longitude])
                    .setContent(searched_city + ": " + response_obtained.list[0].main.temp)
                    .openOn(map);
            
            });


            $("#windy").toggleClass("displayed_windy");
        }
      });

    $('.nastaveni').click(function () {
        $(this).toggleClass("nastaveni_rotate nastaveni_transition");
        $(".nastaveni_panel").toggle("slide");
    });

    function hide() {
        $(this).toggleClass("close_search");
        $(".overlay").toggleClass("displayed");
    };

    $('.search_button').click(function () {
        hide();
    });

    var colors = new Array(
        [62,35,255],
        [60,255,60],
        [255,35,98],
        [45,175,230],
        [255,0,255],
        [255,128,0]);
      
      var step = 0;
      //color table indices for: 
      // current color left
      // next color left
      // current color right
      // next color right
      var colorIndices = [0,1,2,3];
      
      //transition speed
      var gradientSpeed = 0.0007;
      
      function updateGradient()
      {
        
        if ( $===undefined ) return;
        
      var c0_0 = colors[colorIndices[0]];
      var c0_1 = colors[colorIndices[1]];
      var c1_0 = colors[colorIndices[2]];
      var c1_1 = colors[colorIndices[3]];
      
      var istep = 1 - step;
      var r1 = Math.round(istep * c0_0[0] + step * c0_1[0]);
      var g1 = Math.round(istep * c0_0[1] + step * c0_1[1]);
      var b1 = Math.round(istep * c0_0[2] + step * c0_1[2]);
      var color1 = "rgb("+r1+","+g1+","+b1+")";
      
      var r2 = Math.round(istep * c1_0[0] + step * c1_1[0]);
      var g2 = Math.round(istep * c1_0[1] + step * c1_1[1]);
      var b2 = Math.round(istep * c1_0[2] + step * c1_1[2]);
      var color2 = "rgb("+r2+","+g2+","+b2+")";
      
       $('body').css({
         background: "-webkit-gradient(linear, left top, right top, from("+color1+"), to("+color2+"))"}).css({
          background: "-moz-linear-gradient(left, "+color1+" 0%, "+color2+" 100%)"});
        
        step += gradientSpeed;
        if ( step >= 1 )
        {
          step %= 1;
          colorIndices[0] = colorIndices[1];
          colorIndices[2] = colorIndices[3];
          
          //pick two new target color indices
          //do not pick the same as the current one
          colorIndices[1] = ( colorIndices[1] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
          colorIndices[3] = ( colorIndices[3] + Math.floor( 1 + Math.random() * (colors.length - 1))) % colors.length;
          
        }
      }
      
      setInterval(updateGradient,10);
});



