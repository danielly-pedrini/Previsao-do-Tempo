const apiKey = "aff2e4c284d948779a842922252602"; // Substitua pela sua chave válida da WeatherAPI
const unsplashKey = "ODPOHhNsurZeye2K-HNn8i2RZ0j-J0oa9RmOg3n8PJs"; // Chave válida do Unsplash
const imagemPadrao = "caminho_para_imagem_padrao.jpg"; // Defina um caminho para a imagem padrão

// Atualiza a imagem de fundo com base no local pesquisado
async function atualizarImagemFundo(local) {
    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${local}+landmark&client_id=${unsplashKey}&orientation=landscape&per_page=1`
        );

        if (!response.ok) throw new Error('Erro ao buscar imagem');

        const data = await response.json();
        const imageUrl = data.results.length > 0 ? data.results[0].urls.regular : imagemPadrao;

        const img = new Image();
        img.onload = function () {
            document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${imageUrl}')`;
        };
        img.onerror = function () {
            document.body.style.backgroundImage = `url('${imagemPadrao}')`;
        };
        img.src = imageUrl;
    } catch (error) {
        console.error("Erro ao buscar imagem do local:", error);
        document.body.style.backgroundImage = `url('${imagemPadrao}')`;
    }
}

// Formata a data de YYYY-MM-DD para DD/MM
function formatarData(data) {
    if (!data || !data.includes('-')) return "Data inválida";
    const partes = data.split('-');
    return `${partes[2]}/${partes[1]}`;
}

// Insere os dados do clima na tela
function colocarDadosNaTela(dados) {
    const local = dados.location;
    const current = dados.current;
    const condicao = current.condition;

    let nomeLocal = local.name;
    if (local.region && local.region !== local.name) {
        nomeLocal += `, ${local.region}`;
    }

    document.querySelector('h1').innerHTML = `Previsão do tempo em ${nomeLocal}`;
    document.querySelector('.nuvem h2').innerHTML = `${Math.floor(current.temp_c)} °C`;
    document.querySelector('.nuvem h3').innerHTML = condicao.text;
    document.querySelector('.nuvem p').innerHTML = `Umidade: ${current.humidity} %`;
    document.querySelector('.nuvem img').src = `https:${condicao.icon}`;
}

// Mostra a previsão para os próximos 3 dias
function mostrarPrevisao3Dias(dados) {
    const container = document.getElementById('forecast-cards');
    container.innerHTML = '';

    dados.forecast.forecastday.forEach((previsao) => {
        const dia = formatarData(previsao.date);
        const tempMax = Math.round(previsao.day.maxtemp_c);
        const condicao = previsao.day.condition;

        const card = document.createElement('div');
        card.className = 'forecast-card';

        card.innerHTML = `
            <div class="date">${dia}</div>
            <img src="https:${condicao.icon}" alt="Tempo">
            <div class="temp">${tempMax}°C</div>
            <div class="description">${condicao.text}</div>
        `;

        container.appendChild(card);
    });
}

// Busca os dados do clima na API
async function buscarLocal(local) {
    try {
        const resposta = await fetch(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${local}&days=3&aqi=no&alerts=no&lang=pt`
        );

        if (!resposta.ok) {
            if (resposta.status === 400) alert("Local não encontrado!");
            throw new Error('Erro na API');
        }

        const dados = await resposta.json();

        colocarDadosNaTela(dados);
        await atualizarImagemFundo(dados.location.name);
        mostrarPrevisao3Dias(dados);

        localStorage.setItem('ultimoLocal', local);
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Erro ao buscar dados do clima. Por favor, tente novamente mais tarde.");
    }
}

// Ação ao clicar no botão ou pressionar Enter
function CliqueiNoBotao() {
    const input = document.getElementById("cidade");
    const local = input.value.trim();

    if (local === "") {
        alert("Por favor, insira o nome de uma cidade, estado ou país!");
        return;
    }

    if (local === localStorage.getItem('ultimoLocal')) {
        alert("Essa cidade já está sendo exibida!");
        return;
    }

    buscarLocal(local);
}

// Permite buscar o clima pressionando Enter
document.getElementById("cidade").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        CliqueiNoBotao();
    }
});

// Carrega os últimos dados salvos ao iniciar a página
window.onload = function () {
    const ultimoLocal = localStorage.getItem('ultimoLocal');
    if (ultimoLocal) {
        document.getElementById('cidade').value = ultimoLocal;
        buscarLocal(ultimoLocal);
    }
};