(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root-of-the-server]__05ea2a12._.js", {

"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[project]/src/app/(auth)/sign-in/services/auth.service.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "getUserProfile": (()=>getUserProfile),
    "signIn": (()=>signIn)
});
const signIn = async (email, password)=>{
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/login`, {
            method: "POST",
            body: JSON.stringify({
                email,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || "Error en la autenticación";
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Error desconocido al iniciar sesión");
    }
};
const getUserProfile = async (token)=>{
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users/profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });
    return response.json();
};
}}),
"[project]/src/auth.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "auth": (()=>auth),
    "handlers": (()=>handlers),
    "signIn": (()=>signIn),
    "signOut": (()=>signOut)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@auth/core/providers/credentials.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$sign$2d$in$2f$services$2f$auth$2e$service$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/sign-in/services/auth.service.ts [middleware-edge] (ecmascript)");
;
;
;
const { handlers, signIn, signOut, auth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
            credentials: {
                email: {},
                password: {}
            },
            async authorize (credentials) {
                try {
                    const response = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$sign$2d$in$2f$services$2f$auth$2e$service$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["signIn"])(credentials.email, credentials.password);
                    const userProfile = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$sign$2d$in$2f$services$2f$auth$2e$service$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getUserProfile"])(response.token);
                    const user = {
                        ...userProfile,
                        token: response.token
                    };
                    if ("TURBOPACK compile-time falsy", 0) {
                        "TURBOPACK unreachable";
                    }
                    return user;
                } catch (error) {
                    console.log("ERROR", error);
                    throw new Error(error);
                }
            }
        })
    ],
    pages: {
        signIn: "/sign-in"
    },
    session: {
        strategy: "jwt"
    },
    callbacks: {
        authorized: async ({ auth })=>{
            // Logged in users are authenticated, otherwise redirect to login page
            // return !!auth;
            return !!auth;
        },
        jwt ({ token, user }) {
            if (user) {
                token.session = user;
            }
            return token;
        },
        session ({ session, token }) {
            session.token = token.session.token;
            session.iat = token.iat;
            session.exp = token.exp;
            session.jti = token.jti;
            session.user = {
                id: token.session.id,
                email: token.session.email,
                name: token.session.name,
                last_name: token.session.last_name,
                type: token.session.type,
                role: token.session.role
            };
            return session;
        }
    }
});
}}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/auth.ts [middleware-edge] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["auth"])(async (req)=>{
    if (!req.auth && req.nextUrl.pathname !== "/sign-in") {
        const newUrl = new URL("/sign-in", req.nextUrl.origin);
        return Response.redirect(newUrl);
    }
    if (req.auth && req.nextUrl.pathname === "/dashboard") {
        debugger;
    // supabase.auth.setSession({
    //   access_token: req.auth.access_token,
    //   refresh_token: req.auth.refresh_token,
    // });
    // const { data } = await getProjectsByCompanyId(req.auth.user.company.id);
    // const newUrl = new URL(`/dashboard/${data?.[0]?.id}`, req.nextUrl.origin);
    // return Response.redirect(newUrl);
    }
});
const config = {
    matcher: [
        "/dashboard/:path*"
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot-of-the-server%5D__05ea2a12._.js.map