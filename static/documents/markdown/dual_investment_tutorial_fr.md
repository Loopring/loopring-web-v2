# Qu’est-ce que Double Investissement?

Double Investissement est un produit structuré à capital non protégé. Lors de l’achat, vous pouvez choisir l’actif sous-jacent, la monnaie de l’investissement, le montant de l’investissement et la date de règlement. Votre rendement sera libellé dans la monnaie de l’investissement ou une devise alternative, selon les conditions ci-dessous.

Il existe deux types de produits Double Investissement : “Acheter à bas prix” et “vendre à prix élevé”.

Les produits Acheter à bas prix vous donnent la chance d’acheter (avec des cryptomonnaies stables (USDC)) la cryptomonnaie désirée (tel que LRC) a un prix plus bas dans le futur.

- Cible atteinte : à la date de règlement, si le prix courant est égal ou moins élevé que le prix cible, la devise cible (LRC) sera achetée;
- Cible non atteinte : à la date de règlement, si le prix courant est plus élevé que le prix cible, vous conserverez votre cryptomonnaie stable;
Dans les deux cas, vous gagnerez d’abord de l’intérêt en cryptomonnaie stable. Une fois que le prix cible est atteint, le montant souscrit et les revenus en intérêts seront utilisés pour acheter du LRC.

Les produits Vendre à prix élevé vous donnent la chance de vendre votre cryptomonnaie (tel que LRC) à un prix plus élevé dans le futur (pour du USDC).

- Cible atteinte : à la date de règlement, le prix courant est égal ou plus élevé que le prix cible alors votre LRC sera vendu pour du USDC;
- Cible non atteinte : à la date de règlement, le prix courant est moins élevé que le prix cible alors vous conserverez votre LRC.
Dans les deux cas, vous gagnerez d’abord de l’intérêt dans votre cryptomonnaie (LRC). Une fois que le prix cible est atteint, le montant souscrit et les revenus en intérêts seront vendus pour du USDC.

Les jetons investis sont simplement verrouillés, mais ils demeurent dans votre compte puisque Loopring est un échange décentralisé (DEX).

Chaque produit acheté a une date de règlement. Nous prendrons une moyenne du prix courant dans les 30 dernières minutes avant 16:00 (UTC+8) à la date de règlement pour déterminer le prix de règlement.

> **Veuillez vous assurer que vous comprenez bien le produit et les risques avant d’investir.**
***

## Comment calculer mon rendement?

Lorsque le prix cible est atteint, votre investissement et les revenus en intérêts seront convertis en USDC avec le prix cible comme taux de conversion.

### Exemple 1 :

###### Investir du LRC pour un Double Investissement en LRC-USDC

```text 
Prix cible : 0,48  
Date de règlement : 21-AOÛT-2022  
TAP : 73% 
Devise d’investissement : LRC 
```

Supposez que nous sommes le 18 août, le prix du LRC est de 0,42 et l’utilisateur décide d’investir 1000 LRC en Double Investissement avec une date de règlement la même semaine.

###### Le 21-AOÛT-2022

- Scénario 1
  - `Si le prix de règlement du LRC est plus bas que le prix cible de 0,48 USDC, l’utilisateur recevra 0,6% de LRC, c’est-à-dire 1000 * (1 + 73% / 365 * 3) LRC = 1006 LRC. `
- Scénario 2
  - `Si le prix de règlement du LRC est plus élevé que le prix cible de 0,48 USDC, l’utilisateur final recevra 0,6% d’USDC, c’est-à-dire 1000 * 0.48 * (1 + 73% / 365 * 3) USDC = 482.88 USDC.`

Suite à l’expiration de l’ordre, l’utilisateur recevra 0,6% du revenu. La seule incertitude est la monnaie du rendement, qui dépend du prix de règlement (LRC/USDC) au moment de l’expiration.

### Exemple 2 :

###### Investir du USDC pour un Double Investissement en LRC-USDC

```text 
Prix cible: 0,38 
Date de règlement : 21-AOÛT-2022  
TAP : 73% 
Monnaie d’investissement : USDC 
```

Supposez que nous sommes le 18 août, le prix du LRC est de 0,42 et l’utilisateur décide d’investir 1000 USDC en Double Investissement avec une date de règlement dans une semaine.

###### Le 21-AOÛT-2022
- Scénario 1
  - `Le prix du LRC à la date de règlement est moins élevé que le prix cible de 0,38 USDC, l’utilisateur recevra 0,6% de LRC, c’est-à-dire (1000/0.38) * (1 + 73% / 365 * 3) LRC = 2647.368 LRC.`
- Scénario 2
  - `Si le prix du règlement du LRC est plus élevé que le prix cible de 0,38 USDC, l’utilisateur final recevra 0,6% d’USDC, c’est-à-dire 1000 * (1 + 73% / 365 * 3) USDC = 1006 USDC.`

Suite à l’expiration de l’ordre, l’utilisateur recevra 0,6% du revenu. La seule incertitude est la monnaie du rendement, qui dépend du prix de règlement (LRC/USDC) au moment de l’expiration. 

### Définitions
| Nom | Description |
| :------------ | :------------ |
| Monnaie d’investissement  | La monnaie dans laquelle vous avez acheté le double investissement.  |
| Monnaie de règlement  | La monnaie que vous recevrez lorsque l’ordre expirera. La monnaie de règlement sera soit la monnaie cible ou du USDC. Chaque produit est réglé en fonction de si le prix cible a été atteint ou non.  |
| Date de règlement  | La date à laquelle l’ordre est réglé. Le rendement de l’ordre sera crédité automatiquement à votre compte à cette date après 16:00 (UTC+8).  |
| TAP  | Le rendement annualisé est calculé comme rendement annuel équivalent si l’utilisateur continuait d’acheter le rendement donné pour une année entière. Rendement annualisé = rendement / (date d’expiration – aujourd’hui) &#42;365. *Astuce : la période de détention est actuarielle à la milliseconde.* |
| Prix cible  | Le prix cible est un prix de référence. À la date d’expiration, le prix de règlement sera comparé à ce prix de référence.  |
| Prix de règlement  | La moyenne arithmétique de l’index de règlement échantillonné toutes les 4 secondes dans les 30 dernières minutes avant 16:00 (UTC+8) à la date d’expiration.  |
| Index de règlement  | L’index de règlement provient des principaux grands échanges. Pour l’ETH, cela inclut Bittrex, Bitstamp, Coinbase Pro, Gemini, Kraken, Itbit and LMAX Digital. Pour LRC, cela inclut Huobi, Binance, OKEx, KuCoin et FTX. L’index est calculé comme la moyenne de ces valeurs (pondérées également).  |

### FAQ
Q： Quelle est la date limite d’achat pour le double investissement?  
R： Veuillez finaliser l’achat avant 15:00 (UTC+8) à la date de règlement.

Q： Est-ce qu’un double investissement peut être retiré ou récupéré avant d’être réglé.  
R： Après avoir acheté un ordre, celui-ci ne peut être annulé ou récupéré avant la date de règlement. Une fois l’ordre réglé, le jeton retournera dans votre compte. 

Q： Quand recevrai-je les retours sur mon investissement?  
R： Nous calculerons vos retours sur votre investissement à la date de règlement à 08:00 UTC selon le prix de règlement et le prix cible. Vous recevrez vos retours dans les 6 heures. 

Q： Quel est le risque d’un double investissement?  
R： Selon la règle du double investissement, l’incertitude est la monnaie de règlement. La monnaie de règlement dépendra de si le prix de règlement a atteint le prix cible à la date de règlement.

Q：Quels sont les bénéfices d’utiliser Double Investissement sur Loopring?  
R：Les jetons que vous choisissez d’investir sont verrouillés, mais ils restent dans votre compte puisque Loopring est un échange décentralisé (DEX). Lorsque la transaction expire, si le prix de règlement n’est pas atteint, vous ferez un profit et les actifs gelés seront déverrouillés. Si le prix de règlement est atteint, votre investissement et vos revenus en intérêts seront convertis en jeton cible au prix cible.

*Le risque d’investir en LRC est que, si le prix augmente fortement, le LRC détenu sera vendu pour du USDC au prix cible.
Le risque d’investir en USDC est que, si le prix chute, l’USDC détenu sera converti en LRC au prix cible (même si le prix du LRC est plus bas que le prix cible).*
***
