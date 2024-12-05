var express = require("express");
var exe = require("./../connection");
var url = require("url");
var router = express.Router();

function checklogin(req)
{
    if(req.session.customer_id)
    {
        return true
    }
    else
    {
        return false
    }
}

router.get("/",async function(req,res)
{
    //URL DATA
    var url_data = url.parse(req.url,true).query;

    //category
    var category = await exe(`SELECT * FROM category`);

    //Featured Products
    var featured = await exe(`SELECT *,(SELECT MIN(product_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_price>0) 
            as price,

            (SELECT MIN(product_duplicate_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_duplicate_price>0) 
            as duplicate_price FROM product WHERE product_label = "Featured"`)

    //Best Selling
    var best_selling = await exe(`SELECT *,(SELECT MIN(product_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_price>0) 
            as price,

            (SELECT MIN(product_duplicate_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_duplicate_price>0) 
            as duplicate_price FROM product WHERE product_label = "Best Selling"`)

    //Flash
    var flash = await exe(`SELECT *,(SELECT MIN(product_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_price>0) 
            as price,

            (SELECT MIN(product_duplicate_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_duplicate_price>0) 
            as duplicate_price FROM product WHERE product_label = "Flash"`)


    //Trending
    var trending = await exe(`SELECT *,(SELECT MIN(product_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_price>0) 
            as price,

            (SELECT MIN(product_duplicate_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_duplicate_price>0) 
            as duplicate_price FROM product WHERE product_label = "Trending"`)

    

    var data = await exe(`SELECT * FROM company`);
    var slides = await exe("SELECT * FROM slider");
    var obj = {"company_info":data[0],
                "slides":slides,
                "category":category,
                "featured":featured,
                "best_selling":best_selling,
                "flash":flash,
                "trending":trending,
                "is_login":checklogin(req)
    };
    res.render("user/index.ejs",obj);
});

router.get("/about",async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req)
    };
    res.render("user/about.ejs",obj);
});

router.get("/shop",async function(req,res)
{
     //URL DATA
     var url_data = url.parse(req.url,true).query;

    var total_records = await exe(`SELECT COUNT(*) as ttl FROM product`);
        total_records = total_records[0].ttl;
        per_page = 2;
        total_pages = total_records / per_page;
        if(parseInt(total_pages)<total_pages)
        {
            total_pages = parseInt(total_pages)+1;
        }
        if(url_data.page_no==undefined)
        {
            page_no = 1;
        }
        else
        {
            page_no = url_data.page_no
        }
        starting_index_of_limit = (per_page*page_no) - per_page;
        console.log(total_records);

   
    //category
    var category = await exe(`SELECT * FROM category`);

    //colors
    var colors = await exe(`SELECT product_colors FROM product GROUP BY product_colors`);

    //companies
    var companies = await exe(`SELECT product_company FROM product GROUP BY product_company`);

    //products - min price
    cond = "";
    if(url_data.category_id != undefined)
    {
        cond = ` WHERE category_id = '${url_data.category_id}'`;
    }
    if(url_data.color != undefined)
    {
        cond = ` WHERE product_colors = '${url_data.color}'`;
    }
    if(url_data.company != undefined)
    {
        cond = ` WHERE product_company = '${url_data.company}'`;
    }
    if(url_data.search != undefined)
    {
        cond = ` WHERE product_name LIKE '%${url_data.search}%'`;
    }
        

        var products = await exe(`SELECT *,
            (SELECT MIN(product_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_price>0) 
            as price,

            (SELECT MIN(product_duplicate_price) FROM product_pricing WHERE product_pricing.product_id = product.product_id AND
            product_duplicate_price>0) 
            as duplicate_price 
            
            FROM product` + cond + ` LIMIT ${starting_index_of_limit}, ${per_page}`);

    
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "category":category,
                "colors":colors,
                "companies":companies,
                "products":products,
                "is_login":checklogin(req),
                "total_pages":total_pages,
                "page_no":page_no
            };

    res.render("user/shop.ejs",obj); 
});

router.get("/blog",async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req)
    };
    res.render("user/blog.ejs",obj);
});

router.get("/contact",async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req)
    };
    res.render("user/contact.ejs",obj);
});

router.get("/product_info/:id", async function(req,res)
{
    var id = req.params.id;
    var product = await exe(`SELECT * FROM product WHERE product_id = '${id}'`); 
    var product_pricing = await exe(`SELECT * FROM product_pricing WHERE product_id = '${id}'`);

    if(checklogin(req))
    {
        var customer_id = req.session.customer_id;
        var product_pricing = await exe(`
            SELECT *, 
            (SELECT MIN(cart_id) FROM cart WHERE customer_id = '${customer_id}' AND cart.product_pricing_id = product_pricing.product_pricing_id) as cart_id
            FROM product_pricing 
            WHERE product_id = '${id}'`);
            console.log(product_pricing);
    }

    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "product":product[0],
                "product_pricing":product_pricing,
                "is_login":checklogin(req)
    };
    res.render("user/product_info.ejs",obj);
});

router.get("/login",async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req)
    };
    res.render("user/login.ejs",obj);
});

router.get("/register",async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req)
    };
    res.render("user/register.ejs",obj);
});


router.post("/do_register", async function(req,res)
{
    var d = req.body;
    var sql = `INSERT INTO customer (customer_name, customer_mobile, customer_email, customer_password) 
                VALUES ('${d.customer_name}','${d.customer_mobile}','${d.customer_email}','${d.customer_password}')`;
    var data = await exe(sql);
    // res.send(data);
    res.redirect("/login");
});


router.post("/do_login", async function(req,res)
{
    var d = req.body;
    var sql = `SELECT * FROM customer WHERE customer_mobile = '${d.customer_mobile}' AND
                customer_password = '${d.customer_password}'`;
    var data = await exe(sql);
    if(data.length > 0)
    {
        req.session.customer_id = data[0]['customer_id'];
        res.redirect("/shop");
    }
    else
    {
        alert("Login Failed");
    }
});

function verifyUrl(req,res,next)
{
    req.session.customer_id = 1;
    if(req.session.customer_id)
    {
        next();
    }
    else
    {
        res.redirect("/login");
    }
};

router.get("/add_to_cart/:product_id/:product_pricing_id",verifyUrl,async function(req,res)
{
    var d = req.params;
    d.qty = 1;
    d.customer_id = req.session.customer_id;
    var sql = `INSERT INTO cart (product_id, product_pricing_id, customer_id, qty)
                VALUES ('${d.product_id}','${d.product_pricing_id}','${d.customer_id}','${d.qty}')`;
    var data = await exe(sql);
    res.redirect("/shop");
});

router.get("/logout", function(req,res)
{
    req.session.customer_id = undefined;
    res.redirect("/");
});


router.get("/cart",verifyUrl,async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var sql = `SELECT * FROM 
                product, product_pricing, cart 
                WHERE
                product.product_id = product_pricing.product_id 
                AND 
                product_pricing.product_pricing_id = cart.product_pricing_id
                AND
                product.product_id = cart.product_id
                AND
                cart.customer_id = '${req.session.customer_id}'`;
    var carts = await exe(sql);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req),
                "carts":carts
    };
    res.render("user/cart.ejs",obj);
});


router.post("/increase_qty_in_backend",async function(req,res)
{
    var sql = `UPDATE cart SET qty=qty+1 WHERE cart_id = '${req.body.cart_id}'`;
    var data = await exe(sql)
    res.send(data);
});


router.post("/decrease_qty_in_backend", async function(req,res)
{
    var sql = `UPDATE cart SET qty= qty-1 WHERE cart_id = '${req.body.cart_id}'`;
    var data = await exe(sql);
    res.send(data);
});


router.get("/delete_cart_product/:id",async function(req,res)
{
    var id = req.params.id;
    var sql = `DELETE FROM cart WHERE cart_id = '${id}'`;
    var data = await exe(sql);
    res.redirect("/cart");
});


router.get("/checkout",verifyUrl,async function(req,res)
{
    var sql = `SELECT * FROM 
                product, product_pricing, cart 
                WHERE
                product.product_id = product_pricing.product_id 
                AND 
                product_pricing.product_pricing_id = cart.product_pricing_id
                AND
                product.product_id = cart.product_id
                AND
                cart.customer_id = '${req.session.customer_id}'`;
    var carts = await exe(sql);
    if(carts.length == 0)
    {
        res.redirect("/shop")
        return;
    }
    var data = await exe(`SELECT * FROM company`);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req),
                "carts":carts
    };
    res.render("user/checkout.ejs",obj);
})

router.post("/place_order",verifyUrl,async function(req,res)
{
    var d = req.body;
    var sql = `SELECT * FROM 
    product, product_pricing, cart 
    WHERE
    product.product_id = product_pricing.product_id 
    AND 
    product_pricing.product_pricing_id = cart.product_pricing_id
    AND
    product.product_id = cart.product_id
    AND
    cart.customer_id = '${req.session.customer_id}'`;
    var carts = await exe(sql);
    var total = 0;
    for(var i=0;i<carts.length;i++)
        total = total + (carts[i].product_price * carts[i].qty);
    
    var today = new Date().toISOString().slice(0,10);

    var sql = `INSERT INTO order_tbl
            (customer_id,customer_name,customer_mobile,customer_state,customer_district,customer_city,
            customer_area,customer_landmark,customer_address_pincode,payment_mode,order_date,order_amount,payment_status,
            order_status) 
            Values 
            ('${req.session.customer_id}','${d.customer_name}','${d.customer_mobile}','${d.customer_state}','${d.customer_district}','${d.customer_city}',
            '${d.customer_area}','${d.customer_landmark}','${d.customer_address_pincode}','${d.payment_mode}','${today}','${total}','pending',
            'pending')`;

    var data = await exe(sql);

    var order_id = data.insertId;

    for (var i=0;i<carts.length;i++) 
    {
        var sql1 = `INSERT INTO order_detail (order_id, product_id, customer_id, product_pricing_id, product_name, product_price, product_color,
                    product_size, product_image1, product_company, product_qty, product_total) 
                    VALUES ('${order_id}',
                            '${carts[i].product_id}',
                            '${req.session.customer_id}',
                            '${carts[i].product_pricing_id}',
                            '${carts[i].product_name}',
                            '${carts[i].product_price}',
                            '${carts[i].product_colors}',
                            '${carts[i].product_size}',
                            '${carts[i].product_image1}',
                            '${carts[i].product_company}',
                            '${carts[i].qty}',
                            '${(carts[i].qty * carts[i].product_price)}')`;

        var result = await exe(sql1);
    }

    var sql3 = `DELETE FROM cart WHERE customer_id = '${req.session.customer_id}'`;
    var result2 = await exe(sql3);
    

    if(req.body.payment_mode == 'UPI')
    {
    res.redirect("/online_payment/"+order_id); 
    }
    else
    res.redirect("/order_info/"+order_id); 
});


router.get("/order_info/:order_id",verifyUrl,async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var order = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.order_id}'`);
    var order_products = await exe(`SELECT * FROM order_detail WHERE order_id = '${req.params.order_id}'`);
    var obj = {"company_info":data[0],
                "is_login":checklogin(req),
                "order":order[0],
                "order_products":order_products
    };
    res.render("user/order_info.ejs",obj);
});


router.get("/profile",verifyUrl,async function(req,res)
{
    var data = await exe(`SELECT * FROM company`);
    var data2 = await exe(`SELECT * FROM customer`)
    var obj = {
        "customer":data2[0],
        "company_info":data[0],
                "is_login":checklogin(req)
    };
    res.render("user/profile.ejs",obj);
});

router.get("/user_info/:customer_id",verifyUrl,async function(req,res)
{
    var id = req.params.customer_id;
    var data = await exe(`SELECT * FROM company`);
    var data2 = await exe(`SELECT * FROM customer WHERE customer_id = '${id}'`);
    var obj = {"company_info":data[0],
                "user_info":data2[0],
        "is_login":checklogin(req)
    };
    res.render("user/user_info.ejs",obj);
});


router.get("/change_pass/:customer_id",verifyUrl,async function(req,res)
{
    var id = req.params.customer_id;
    var data = await exe(`SELECT * FROM company`);
    var data2 = await exe(`SELECT * FROM customer WHERE customer_id = '${id}'`);
    var obj = {"company_info":data[0],
                "user_info":data2[0],
        "is_login":checklogin(req)
    };
    res.render("user/change_pass.ejs",obj);
});

router.post("/change_password/:customer_id",verifyUrl, async function(req,res)
{
    var id = req.params.customer_id;
    var sql = `UPDATE customer SET customer_password = '${req.body.customer_password}' WHERE customer_id = '${id}'`
    var data = await exe(sql)
    // res.send(data);
    res.redirect("/user_info/"+id)
});


router.get("/user_orders/:customer_id",verifyUrl,async function(req,res)
{
    var id = req.params.customer_id;
    var data = await exe(`SELECT * FROM company`);
    var data2 = await exe(`SELECT * FROM order_detail WHERE customer_id = '${id}'`);
    var obj = {"company_info":data[0],
                "order_details":data2,
        "is_login":checklogin(req)
    };
    res.render("user/user_orders.ejs",obj);
})

router.get("/online_payment/:order_id",verifyUrl,async function(req,res)
{
    var data = await exe(`SELECT * FROM order_tbl,customer WHERE order_id = '${req.params.order_id}' AND customer.customer_id = order_tbl.customer_id`)
    var obj = {"order":data[0]}
    res.render("user/online_payment.ejs",obj)
});

router.post("/confirm_payment/:order_id",async function(req,res)
{
    var transaction_id = req.body.razorpay_payment_id;
    var order_id = req.params.order_id;
    var sql = `UPDATE order_tbl SET payment_status = 'Complete', transaction_id = '${transaction_id}' WHERE order_id = '${order_id}'`;
    var data = await exe(sql);

    // res.send(req.body);
    res.redirect("/order_info/"+order_id)
});

module.exports = router;


/* CREATE TABLE customer (customer_id INT PRIMARY KEY AUTO_INCREMENT, customer_name VARCHAR(100), customer_mobile VARCHAR(20), 
                         customer_email VARCHAR(100), customer_password VARCHAR(100)); */
                        
/*
CREATE TABLE order_tbl (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100),
    customer_mobile VARCHAR(15),
    customer_state VARCHAR(50),
    customer_district VARCHAR(50),
    customer_city VARCHAR(50),
    customer_area VARCHAR(100),
    customer_landmark VARCHAR(50),
    customer_address_pincode VARCHAR(50),
    payment_mode VARCHAR(50),
    order_date DATE,
    order_amount INT,
    payment_status VARCHAR(50),
    transaction_id VARCHAR(100),
    order_status VARCHAR(50),
    dispatched_date VARCHAR(20),
    delivered_date VARCHAR(20),
    cancelled_date VARCHAR(20),
    rejected_date VARCHAR(20),
    returned_date VARCHAR(20)
)



CREATE TABLE order_detail (
    order_detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    product_id INT, 
    customer_id INT, 
    product_pricing_id INT, 
    product_name VARCHAR(100), 
    product_price INT, 
    product_color VARCHAR(20),
    product_size VARCHAR(10), 
    product_image1 TEXT, 
    product_company VARCHAR(100), 
    product_qty INT, 
    product_total INT
    )
*/