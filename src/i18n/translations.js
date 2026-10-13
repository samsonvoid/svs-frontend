/**
 * SVS Translations Dictionary
 * Usage: t('key') returns the label in the active language (EN or SW)
 * Add new keys here and consume via useLanguage() hook.
 */

export const translations = {
    // ── Navigation / Sidebar ────────────────────────────────────────────────
    nav_dashboard:      { en: 'Dashboard',          sw: 'Dashibodi' },
    nav_alerts:         { en: 'Alerts',              sw: 'Tahadhari' },
    nav_inventory:      { en: 'Stock Items',         sw: 'Bidhaa (Stock)' },
    nav_stock_list:     { en: 'Stock List',          sw: 'Orodha ya Stoo' },
    nav_categories:     { en: 'Categories',          sw: 'Makundi' },
    nav_purchases:      { en: 'Stock In',            sw: 'Manunuzi' },
    nav_suppliers:      { en: 'Suppliers',           sw: 'Wasambazaji' },
    nav_logs:           { en: 'Audit Logs',          sw: 'Kumbukumbu' },
    nav_sales:          { en: 'New Sale (POS)',       sw: 'Mauzo Mapya (POS)' },
    nav_reports:        { en: 'Reports',             sw: 'Ripoti' },
    nav_settings:       { en: 'Settings',            sw: 'Mipangilio' },
    nav_overview:       { en: 'Overview & Alerts',   sw: 'Muhtasari & Tahadhari' },
    nav_inventory_grp:  { en: 'Inventory & Stock',   sw: 'Inventory & Stoo' },
    nav_sales_grp:      { en: 'Sales & Business',    sw: 'Sales & Biashara' },
    nav_system:         { en: 'System',              sw: 'Mfumo' },

    // ── Header Page Titles ───────────────────────────────────────────────────
    page_dashboard:     { en: 'Dashboard Overview',             sw: 'Muhtasari wa Dashibodi' },
    page_dashboard_sub: { en: 'Business Summary & Analytics',   sw: 'Muhtasari wa Biashara & Takwimu' },
    page_alerts:        { en: 'Stock Alerts Hub',               sw: 'Tahadhari za Stoo' },
    page_alerts_sub:    { en: 'Out of Stock & Reorder Alerts',  sw: 'Bidhaa Zilizokwisha & Zinazohitaji Agizo' },
    page_inventory:     { en: 'Inventory / Products',           sw: 'Inventory / Bidhaa' },
    page_inventory_sub: { en: 'Stock Management & Product List',sw: 'Usimamizi wa Stock & Orodha ya Bidhaa' },
    page_purchases:     { en: 'Purchases (Stock In)',           sw: 'Manunuzi (Pokea Mzigo)' },
    page_purchases_sub: { en: 'Receive New Stock from Suppliers', sw: 'Kupokea Mzigo Mpya Kutoka Suppliers' },
    page_suppliers:     { en: 'Suppliers',                      sw: 'Wasambazaji' },
    page_suppliers_sub: { en: 'Supplier Management & Contacts', sw: 'Usimamizi wa Wasambazaji & Mawasiliano' },
    page_sales:         { en: 'Sales (POS)',                    sw: 'Mauzo (POS)' },
    page_sales_sub:     { en: 'New Sales & Stock Deductions',   sw: 'Utoaji wa Bidhaa & Mauzo Mapya' },
    page_reports:       { en: 'Business Reports',              sw: 'Ripoti za Biashara' },
    page_reports_sub:   { en: 'Revenue, Profit & Trends',      sw: 'Uchambuzi wa Mapato, Faida & Mizania' },
    page_logs:          { en: 'Audit Trail (Stock Logs)',       sw: 'Audit Trail (Kumbukumbu)' },
    page_logs_sub:      { en: 'All Stock Movements (IN / OUT)', sw: 'Historia ya Mienendo Yote ya Stock (IN / OUT)' },
    page_categories:    { en: 'Categories',                    sw: 'Makundi' },
    page_categories_sub:{ en: 'Product Category Management',   sw: 'Upangaji wa Makundi ya Bidhaa' },
    page_settings:      { en: 'Settings',                      sw: 'Mipangilio' },
    page_settings_sub:  { en: 'Business Info & System Config', sw: 'Taarifa za Biashara & Mfumo' },

    // ── Inventory Page ───────────────────────────────────────────────────────
    inv_title:          { en: 'Inventory / Products',          sw: 'Inventory / Bidhaa' },
    inv_subtitle:       { en: 'Manage your full product catalog — add, edit, and track all items in real time.', sw: 'Simamia bidhaa zako zote — ongeza, hariri, na fuatilia kwa wakati halisi.' },
    inv_add_btn:        { en: 'Add Product',                   sw: 'Ongeza Bidhaa' },
    inv_search:         { en: 'Search by name or SKU...',      sw: 'Tafuta kwa jina au SKU...' },
    inv_filter_all:     { en: 'All Products',                  sw: 'Bidhaa Zote' },
    inv_filter_low:     { en: 'Low Stock Only',                sw: 'Zilizopungua Tu' },
    // KPI Cards
    kpi_total_skus:     { en: 'Total Products',                sw: 'Aina za Bidhaa' },
    kpi_total_skus_sub: { en: 'Registered SKUs',               sw: 'SKUs zilizosajiliwa' },
    kpi_stock_units:    { en: 'Stock Units',                   sw: 'Vipande Stoo' },
    kpi_stock_units_sub:{ en: 'Total items in stock',          sw: 'Jumla ya items zote' },
    kpi_inv_value:      { en: 'Inventory Value',               sw: 'Thamani ya Stoo' },
    kpi_inv_value_sub:  { en: 'Cost price basis',              sw: 'Bei ya ununuzi (Cost)' },
    kpi_low_stock:      { en: 'Low Stock',                     sw: 'Zilizopungua' },
    kpi_low_stock_sub:  { en: 'Below minimum level',           sw: 'Chini ya kiwango' },
    kpi_out_of_stock:   { en: '{n} out of stock',              sw: '{n} zimeisha' },

    // ── Sales Page ───────────────────────────────────────────────────────────
    sales_title:        { en: 'Sales / POS',                   sw: 'Mauzo / POS' },
    sales_subtitle:     { en: 'Process a new sale. Stock is deducted automatically and logged in the audit trail.', sw: 'Fanya mauzo mapya. Stoo inapunguzwa kiotomatiki na kumbukumbu inawekwa.' },
    sales_form_title:   { en: 'New Sale',                      sw: 'Uza Bidhaa' },
    sales_form_sub:     { en: 'New sale transaction',          sw: 'Muamala mpya wa mauzo' },
    sales_history:      { en: 'Sales History',                 sw: 'Historia ya Mauzo' },
    sales_search:       { en: 'Search sale ID...',             sw: 'Tafuta nambari ya mauzo...' },
    sales_add_item:     { en: 'Add Another Item',              sw: 'Ongeza Bidhaa Nyingine' },
    sales_grand_total:  { en: 'Grand Total',                   sw: 'Jumla Kuu' },
    sales_complete:     { en: 'Complete Sale',                 sw: 'Kamilisha Mauzo' },
    sales_processing:   { en: 'Processing...',                 sw: 'Inaprocess...' },
    // KPI Cards
    kpi_today_sales:    { en: "Today's Revenue",               sw: 'Mauzo Leo' },
    kpi_today_sales_sub:{ en: '{n} transactions today',        sw: 'Miamala {n} leo' },
    kpi_total_invoices: { en: 'Total Invoices',                sw: 'Jumla Risiti' },
    kpi_total_inv_sub:  { en: 'All transactions',              sw: 'Miamala yote' },
    kpi_units_sold:     { en: 'Units Sold',                    sw: 'Vipande Vilivyouzwa' },
    kpi_units_sold_sub: { en: 'Total items sold',              sw: 'Jumla ya items' },
    kpi_avg_sale:       { en: 'Average Sale',                  sw: 'Wastani Risiti' },
    kpi_avg_sale_sub:   { en: 'Per transaction',               sw: 'Kwa kila muamala' },

    // ── Purchases Page ───────────────────────────────────────────────────────
    pur_title:          { en: 'Stock In (Purchases)',           sw: 'Pokea Mzigo, Stock In' },
    pur_subtitle:       { en: 'Record incoming stock from suppliers. Stock is updated automatically.', sw: 'Weka rekodi ya bidhaa inayoingia kutoka kwa Supplier. Mfumo utaongeza stock moja kwa moja.' },
    pur_form_title:     { en: 'Receive New Stock',             sw: 'Ingiza Mzigo Mpya' },
    pur_form_sub:       { en: 'Fill form to receive stock',    sw: 'Jaza fomu hii kupokea bidhaa' },
    pur_history:        { en: 'Purchase History',              sw: 'Historia ya Manunuzi' },
    pur_search:         { en: 'Search product, SKU, supplier...', sw: 'Tafuta bidhaa, SKU, msambazaji...' },
    // KPI Cards
    kpi_pur_cost:       { en: 'Total Purchase Cost',           sw: 'Gharama Yote' },
    kpi_pur_cost_sub:   { en: 'Total amount paid',             sw: 'Jumla ya malipo' },
    kpi_pur_units:      { en: 'Units Received',                sw: 'Vipande Vilivyoingia' },
    kpi_pur_units_sub:  { en: 'Total items received',          sw: 'Jumla ya items' },
    kpi_pur_batches:    { en: 'Purchase Batches',              sw: 'Idadi ya Mizigo' },
    kpi_pur_batches_sub:{ en: 'Records / batches',             sw: 'Awamu/rekodi' },
    kpi_pur_suppliers:  { en: 'Suppliers Involved',            sw: 'Wasambazaji' },
    kpi_pur_sup_sub:    { en: 'Unique suppliers',              sw: 'Tofauti waliohusika' },

    // ── Common / Shared ──────────────────────────────────────────────────────
    btn_save:           { en: 'Save',                          sw: 'Hifadhi' },
    btn_cancel:         { en: 'Cancel',                        sw: 'Ghairi' },
    btn_edit:           { en: 'Edit',                          sw: 'Hariri' },
    btn_delete:         { en: 'Delete',                        sw: 'Futa' },
    btn_add:            { en: 'Add',                           sw: 'Ongeza' },
    lbl_loading:        { en: 'Loading...',                    sw: 'Inapakia...' },
    lbl_no_data:        { en: 'No data found.',                sw: 'Hakuna data.' },
    lbl_live_system:    { en: 'Live System',                   sw: 'Mfumo Hai' },
    lbl_db_synced:      { en: 'Database Synced',               sw: 'DB Imesawazishwa' },
};
