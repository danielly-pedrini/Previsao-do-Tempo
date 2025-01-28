const apiKey = "a8636ac140394483127d5f228ec37703";
const unsplashKey = "ODPOHhNsurZeye2K-HNn8i2RZ0j-J0oa9RmOg3n8PJs"; // Você precisará se registrar em https://unsplash.com/developers


async function atualizarImagemFundo(cidade) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${cidade}+city+landmark&client_id=${unsplashKey}&orientation=landscape&per_page=1`
        );

        if (!response.ok) {
            throw new Error('Erro ao buscar imagem');
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const imageUrl = data.results[0].urls.regular;


            const img = new Image();
            img.onload = function () {
                document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${imageUrl}')`;
            };
            img.src = imageUrl;
        }
    } catch (error) {
        console.error("Erro ao buscar imagem da cidade:", error);

    }
}


window.onload = function () {
    const ultimaCidade = localStorage.getItem('ultimaCidade');
    if (ultimaCidade) {
        document.getElementById('cidade').value = ultimaCidade;
        buscarCidade(ultimaCidade);
    }
}

function formatarData(timestamp) {
    const data = new Date(timestamp * 1000);
    return data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function colocarDadosNaTela(dados) {
    document.querySelector('h1').innerHTML = "Previsão do tempo em " + dados.name;
    document.querySelector('.nuvem h2').innerHTML = Math.floor(dados.main.temp) + " °C";
    document.querySelector('.nuvem h3').innerHTML = dados.weather[0].description;
    document.querySelector('.nuvem p').innerHTML = "Umidade: " + dados.main.humidity + " %";
    document.querySelector('.nuvem img').src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}.png`;
}

function mostrarPrevisao5Dias(dados) {
    const container = document.getElementById('forecast-cards');
    container.innerHTML = '';

    dados.list.forEach((previsao, index) => {
        if (index % 8 === 0) {
            const card = document.createElement('div');
            card.className = 'forecast-card';

            card.innerHTML = `
                <div class="date">${formatarData(previsao.dt)}</div>
                <img src="https://openweathermap.org/img/wn/${previsao.weather[0].icon}.png" alt="Tempo">
                <div class="temp">${Math.round(previsao.main.temp)}°C</div>
                <div class="description">${previsao.weather[0].description}</div>
            `;

            container.appendChild(card);
        }
    });
}

async function buscarCidade(cidade) {
    try {

        const respostaAtual = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`
        );

        if (!respostaAtual.ok) {
            if (respostaAtual.status === 404) {
                alert("Cidade não encontrada!");
            } else {
                throw new Error('Erro na API');
            }
            return;
        }

        const dadosAtuais = await respostaAtual.json();
        colocarDadosNaTela(dadosAtuais);


        await atualizarImagemFundo(cidade);


        const respostaPrevisao = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${cidade}&appid=${apiKey}&lang=pt_br&units=metric`
        );

        if (respostaPrevisao.ok) {
            const dadosPrevisao = await respostaPrevisao.json();
            mostrarPrevisao5Dias(dadosPrevisao);
        }


        localStorage.setItem('ultimaCidade', cidade);
    } catch (error) {
        console.error("Erro ao buscar dados: ", error);
        alert("Erro ao buscar dados do clima. Por favor, tente novamente mais tarde.");
    }
}

function CliqueiNoBotao() {
    const cidade = document.getElementById("cidade").value;

    if (cidade.trim() === "") {
        alert("Por favor, insira o nome de uma cidade!");
        return;
    }

    buscarCidade(cidade);
}


document.getElementById("cidade").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        CliqueiNoBotao();
    }
});