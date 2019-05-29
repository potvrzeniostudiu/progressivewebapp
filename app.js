
if ('serviceWorker' in navigator) {
    try {
        navigator.serviceWorker.register('sw.js');
        console.log("Registrovano");
    } catch (error) {
        console.log("Registrace selhala");
    }
}




$(document).ready(function () {


    if ("geolocation" in navigator){
		navigator.geolocation.getCurrentPosition(function(position){ 
                console.log(position.coords.latitude, position.coords.longitude);
                
                var settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&zoom=18&addressdetails=1",
                    "method": "GET",
                    success: function () {
                        console.log("lokace obdrzena");
                    },
                    error: function (e) {
                        dump();
                        $("#error_message").append("Nenalezeno");
                    }
                }
        
        
                $.ajax(settings).done(function (location_city) {
                    console.log(location_city.adress.city)
                });

			});
	}else{
		console.log("Browser doesn't support geolocation!");
    }



    clear_map_localstorage();

    //vyplneni ulozenych vysledku
    for (i = 0; i < localStorage.length; i++) {
        display_name = (localStorage.key(i).split("_")[0]);
        $(".saved_results").append("<li id='" + localStorage.key(i) + "'>" + display_name + "<span id='remove_result'></span></li>");
    }

    var server = "https://api.openweathermap.org/data/2.5/forecast?q="
    var owm_key = "&lang=cz&APPID=afb6e76426a0802ed7f8dcdb42900eab&units=metric"

    function dump() {
        $("#error_message").empty();
        $(".results .results_wrapper").children().empty();
        $(".top").empty();
        $("#results_table_detail").empty();
    }

    search_flag = false;

    $('.vypln').submit(function (e) {
        searched_city = $('#mesto').val();
        e.preventDefault();

        if ($("#error_message").text().length != 1) {
            $("#clock").hide();
        } else {
            $("#clock").show()
        }

        hide();

        var settings = {
            "async": true,
            "crossDomain": true,
            "url": server + searched_city + owm_key,
            "method": "GET",
            success: function (response) {
                response_obtained = response;

            },
            error: function (e) {
                dump();
                $("#error_message").append("Nenalezeno");
            }
        }


        $.ajax(settings).done(function (response) {

            populate(response);
            
            //ulozeni dat a vygenerovani hashe
            $("#add_result_button").off('click').on('click', (function () {
                unique_save_hash = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                localStorage.setItem(searched_city + "_" + unique_save_hash, JSON.stringify(response));
                $(".saved_results").append("<li id='" + searched_city + "_" + unique_save_hash + "'>" + searched_city + "<span id='remove_result'></span></li>");
            }));


        });
    });

    //zobrazeni dat
    function populate(response) {

        dump();

        search_flag = true;

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

        $("#result_city").append(searched_city);
        $("#clock").show();

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
            var table_date = response.list[i].dt_txt.slice(6, -3);
            $('body #results_table_detail').append(
                '<tr><td>' + table_date + '</td>' +
                '<td>' + response.list[i].main.temp + '°C</td>' +
                '<td>' + response.list[i].wind.speed + ' m/s</td>' +
                '<td>' + response.list[i].weather[0].description + '</td>' +
                '</tr>');

        }

    }


    function clear_map_localstorage() {
        var keysToRemove = [
            "UUID",
            "log2018",
            "lastSyncableUpdatedItem",
            "settings_country",
            "settings_firstUserSession",
            "settings_homeLocation",
            "settings_homeLocation_ts",
            "settings_ipLocation",
            "settings_sessionCounter201803",
            "settings_startUp",
            "webGLtest3"
        ];

        for (key of keysToRemove) {
            window.localStorage.removeItem(key);
        }
    };


    $(document).on("click", "li #remove_result", function (e) {
        e.stopPropagation();
        window.localStorage.removeItem($(this).closest("li").attr("id"));
        $(this).closest("li").remove();
    });

    $(document).on("click", ".saved_results li", function () {
        response = JSON.parse(window.localStorage.getItem($(this).attr('id')));
        response_obtained = response;
        searched_city = $(this).text();
        populate(response);
    });

    function create_map() {
        latitude = (response_obtained.city.coord.lat);
        longitude = (response_obtained.city.coord.lon);


        const options = {

            // Required: API key
            key: '6sZ6r5filmvn76tOGHe1sYXh140hwHiu',

            // Put additional console output
            verbose: false,

            // Optional: Initial state of the map
            lat: latitude,
            lon: longitude,
            zoom: 5,
        }

        // Initialize Windy API
        windyInit(options, windyAPI => {

            const { map } = windyAPI
            // .map is instance of Leaflet map

            L.popup()
                .setLatLng([latitude, longitude])
                .setContent(response_obtained.city.name + ": " + response_obtained.list[0].main.temp)
                .openOn(map);

        });
        clear_map_localstorage();
    }

    var map_created = false;

    $("#map_button_open").click(function () {
        if (search_flag && map_created) {
            $("#windy").toggleClass("displayed_windy");
            $(".settings_panel").animate({
                width: "toggle"
            });
        } else if (search_flag) {
            create_map();
            map_created = true;
            $("#windy").toggleClass("displayed_windy");
        }
        clear_map_localstorage();
    });

    $('.settings_icon').click(function schovat() {
        if ($(".overlay").hasClass("displayed")) {
            $(".overlay").toggleClass("displayed");
        }
        $(this).toggleClass("nastaveni_rotate nastaveni_transition");
        $(".settings_panel").animate({
            width: "toggle"
        });
    });

    function hide() {
        $(this).toggleClass("close_search");
        $(".overlay").toggleClass("displayed");
    };

    $('.search_button').click(function () {
        if ($(".settings_panel").is(":visible")) {
            $(".settings_panel").animate({
                width: "toggle"
            });
        }
        hide();
    });

    setInterval('updateClock()', 1000);
});


function updateClock() {
    var currentTime = new Date();
    var currentHours = currentTime.getHours();
    var currentMinutes = currentTime.getMinutes();
    var currentSeconds = currentTime.getSeconds();

    currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
    currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

    var currentTimeString = currentHours + ":" + currentMinutes + ":" + currentSeconds;

    $("#clock").html(currentTimeString);
}


