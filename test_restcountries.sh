curl -s https://restcountries.com/v3.1/alpha/bra | jq '.[0] | {name: .name.common, capital: .capital[0], region: .region, languages: .languages, currencies: .currencies, flag: .flag}'
