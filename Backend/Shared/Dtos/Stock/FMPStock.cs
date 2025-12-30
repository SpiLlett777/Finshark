namespace Shared.Dtos.Stock
{
    public class FMPStock
    {
        public string symbol { get; set; } = string.Empty;
        public double price { get; set; }
        public long marketCap { get; set; }
        public double beta { get; set; }
        public double lastDividend { get; set; }
        public string range { get; set; } = string.Empty;
        public double change { get; set; }
        public int changePercentage { get; set; }
        public double volume { get; set; }
        public int averageVolume { get; set; }
        public string companyName { get; set; } = string.Empty;
        public string currency { get; set; } = string.Empty;
        public string cik { get; set; } = string.Empty;
        public string isin { get; set; } = string.Empty;
        public string cusip { get; set; } = string.Empty;
        public string exchangeFullName { get; set; } = string.Empty;
        public string exchange { get; set; } = string.Empty;
        public string industry { get; set; } = string.Empty;
        public string website { get; set; } = string.Empty;
        public string description { get; set; } = string.Empty;
        public string ceo { get; set; } = string.Empty;
        public string sector { get; set; } = string.Empty;
        public string country { get; set; } = string.Empty;
        public string fullTimeEmployees { get; set; } = string.Empty;
        public string phone { get; set; } = string.Empty;
        public string address { get; set; } = string.Empty;
        public string city { get; set; } = string.Empty;
        public string state { get; set; } = string.Empty;
        public string zip { get; set; } = string.Empty;
        public string image { get; set; } = string.Empty;
        public string ipoDate { get; set; } = string.Empty;
        public bool defaultImage { get; set; }
        public bool isEtf { get; set; }
        public bool isActivelyTrading { get; set; }
        public bool isAdr { get; set; }
        public bool isFund { get; set; }
    }
}