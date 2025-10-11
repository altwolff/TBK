// Jakub Kłos
// SYSTEM ANALITYCZNY ZAMÓWIEŃ E-COMMERCE - WERSJA FUNKCYJNA


// Funkcja dodająca zamówienie
function addOrder(orders, customerId, items, discount, region) {
    const newOrder = {
        id: orders.length + 1,
        customerId: customerId,
        items: items,
        discount: discount,
        region: region,
        timestamp: Date.now(),
        processed: false
    };
    const newOrders = [...orders, newOrder];
    return { newOrders, newOrder };
}


// Walidacja zamówienia
function validateOrder(order) {
    const errors = [];
    if (!order.customerId || order.customerId.length < 3) {
        errors.push("Invalid customer ID");
    }

    if (!order.items || order.items.length === 0) {
        errors.push("No items in order");
    }

    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            if (!item.price || item.price <= 0) {
                errors.push(`Invalid price for item: ${item.name}`);
            }
            if (!item.quantity || item.quantity <= 0) {
                errors.push(`Invalid quantity for item: ${item.name}`);
            }
        });
    }

    if (order.discount && (order.discount < 0 || order.discount > 100)) {
        errors.push("Invalid discount percentage");
    }

    return {
        ...order,
        valid: errors.length === 0,
        errors: errors
    };
}


// Obliczanie całkowitej wartości zamówienia
function calculateOrderTotal(order) {
    const subtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const discountAmount = order.discount
        ? subtotal * (order.discount / 100)
        : 0;

    const totalAfterDiscount = subtotal - discountAmount;

    const taxRate =
        order.region === "EU"
            ? 0.23
            : order.region === "US"
                ? 0.08
                : order.region === "Asia"
                    ? 0.15
                    : 0;

    const totalWithTax = totalAfterDiscount + totalAfterDiscount * taxRate;

    return {
        ...order,
        total: totalWithTax
    };
}


// Przetwarzanie wszystkich zamówień
function processAllOrders(orders) {
    const processedOrders = orders.map(order => {
        const validated = validateOrder(order);

        if (validated.valid) {
            const calculated = calculateOrderTotal(validated);
            return { ...calculated, processed: true };
        } else {
            return { ...validated, processed: false };
        }
    });

    const errors = processedOrders
        .filter(order => !order.valid)
        .map(order => ({
            orderId: order.id,
            errors: order.errors
        }));

    const summary = processedOrders.reduce(
        (acc, order) => ({
            processed: acc.processed + (order.valid ? 1 : 0),
            failed: acc.failed + (!order.valid ? 1 : 0)
        }),
        { processed: 0, failed: 0 }
    );

    return {
        processedOrders,
        summary,
        errors
    };
}


// Filtrowanie zamówień według klienta i regionu
function getCustomerOrdersByRegion(orders, customerId, region) {
    return orders.filter(order =>
        order.customerId === customerId &&
        order.region === region &&
        order.processed
    );
}


// Obliczanie statystyk sprzedaży według regionów
function calculateRegionalStats(orders) {
    const processedOrders = orders.filter(order => order.processed);

    const stats = processedOrders.reduce((acc, order) => {
        const region = order.region;

        const itemsSold = order.items.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const current = acc[region] || {
            totalRevenue: 0,
            orderCount: 0,
            itemsSold: 0
        };

        return {
            ...acc,
            [region]: {
                totalRevenue: current.totalRevenue + order.total,
                orderCount: current.orderCount + 1,
                itemsSold: current.itemsSold + itemsSold
            }
        };
    }, {});

    const finalStats = Object.entries(stats).reduce((acc, [region, data]) => {
        return {
            ...acc,
            [region]: {
                ...data,
                averageOrderValue: data.totalRevenue / data.orderCount
            }
        };
    }, {});

    return finalStats;
}


// Znajdowanie najbardziej dochodowych klientów
function getTopCustomers(orders, limit) {
    const processedOrders = orders.filter(order => order.processed);

    const customerTotals = processedOrders.reduce((acc, order) => {
        const customer = acc[order.customerId] || {
            customerId: order.customerId,
            totalSpent: 0,
            orderCount: 0
        };

        return {
            ...acc,
            [order.customerId]: {
                ...customer,
                totalSpent: customer.totalSpent + order.total,
                orderCount: customer.orderCount + 1
            }
        };
    }, {});

    const customerArray = Object.values(customerTotals);

    const sortedCustomers = customerArray.sort(
        (a, b) => b.totalSpent - a.totalSpent
    );

    return sortedCustomers.slice(0, limit);
}


// Generowanie raportu sprzedaży
function generateSalesReport(orders, startDate, endDate) {
    const filteredOrders = orders.filter(
        o => o.processed && o.timestamp >= startDate && o.timestamp <= endDate
    );

    const initialReport = {
        period: { start: startDate, end: endDate },
        summary: {
            totalOrders: 0,
            totalRevenue: 0,
            totalItems: 0,
            averageOrderValue: 0
        },
        regionalBreakdown: {},
        topProducts: []
    };

    const { report, productSales } = filteredOrders.reduce(
        (acc, order) => {
            const totalOrders = acc.report.summary.totalOrders + 1;
            const totalRevenue = acc.report.summary.totalRevenue + order.total;
            const totalItems =
                acc.report.summary.totalItems +
                order.items.reduce((sum, i) => sum + i.quantity, 0);

            const regionData = acc.report.regionalBreakdown[order.region] || {
                orders: 0,
                revenue: 0
            };
            const regionalBreakdown = {
                ...acc.report.regionalBreakdown,
                [order.region]: {
                    orders: regionData.orders + 1,
                    revenue: regionData.revenue + order.total
                }
            };

            const updatedProductSales = order.items.reduce((ps, item) => {
                const existing = ps[item.name] || {
                    name: item.name,
                    quantity: 0,
                    revenue: 0
                };
                return {
                    ...ps,
                    [item.name]: {
                        ...existing,
                        quantity: existing.quantity + item.quantity,
                        revenue: existing.revenue + item.price * item.quantity
                    }
                };
            }, acc.productSales);

            return {
                report: {
                    ...acc.report,
                    summary: {
                        totalOrders,
                        totalRevenue,
                        totalItems,
                        averageOrderValue:
                            totalOrders > 0 ? totalRevenue / totalOrders : 0
                    },
                    regionalBreakdown
                },
                productSales: updatedProductSales
            };
        },
        { report: initialReport, productSales: {} }
    );

    const topProducts = Object.values(productSales).sort(
        (a, b) => b.revenue - a.revenue
    );

    return {
        ...report,
        topProducts
    };
}


// Przykład użycia:
const initialOrders = [];

const { newOrders: ordersAfterAdd1 } = addOrder(initialOrders, "CUST001", [
    { name: "Laptop", price: 1200, quantity: 1 },
    { name: "Mouse", price: 25, quantity: 2 }
], 10, "EU");

const { newOrders: ordersAfterAdd2 } = addOrder(ordersAfterAdd1, "CUST002", [
    { name: "Keyboard", price: 80, quantity: 1 },
    { name: "Monitor", price: 300, quantity: 2 }
], 5, "US");

const { newOrders: ordersAfterAdd3 } = addOrder(ordersAfterAdd2, "CUST001", [
    { name: "Headphones", price: 150, quantity: 1 }
], 0, "EU");

const { processedOrders, summary, errors } = processAllOrders(ordersAfterAdd3);

const topCustomers = getTopCustomers(processedOrders, 5);
const regionalStats = calculateRegionalStats(processedOrders);

const report = generateSalesReport(processedOrders, Date.now() - 1000000, Date.now());

console.log("Summary:", summary);
console.log("Errors:", errors);
console.log("Top Customers:", topCustomers);
console.log("Regional Stats:", regionalStats);
console.log("Sales Report:", report);