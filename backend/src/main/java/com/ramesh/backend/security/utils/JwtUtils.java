package com.ramesh.backend.security.utils;

import com.ramesh.backend.security.service.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtUtils {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpirationMs;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpirationMs;

    private SecretKey keyValue;

    public String generateAccessToken(UserDetailsImpl userDetails){

        Date now = new Date();
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        return buildToken(userDetails,
                Map.of("name", userDetails.getName(), "roles", roles),
                "access", accessTokenExpirationMs
                );

    }

    public String generateRefreshToken(UserDetailsImpl userDetails){
        return buildToken(userDetails,
                Map.of(),
                "refresh",
                refreshTokenExpirationMs);
    }

    public String getEmailFromJwtToken(String token){
        return Jwts.parser()
                .verifyWith(keyValue)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public String getTokenType(String token){
        return Jwts.parser()
                .verifyWith(keyValue)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("type", String.class);
    }

    public boolean validateJwtToken(String token){
        try{
            Jwts.parser()
                    .verifyWith(keyValue)
                    .build()
                    .parseSignedClaims(token);
            return true;

        }catch(MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        }catch (SignatureException e){
            logger.error("Token is tampered token: {}", e.getMessage());
        }catch(ExpiredJwtException e){
            logger.error("JWT token is expired: {}", e.getMessage());
        }catch(UnsupportedJwtException e){
            logger.error("JWT token is unsupported: {}", e.getMessage());
        }catch(IllegalArgumentException e){
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return  false;
    }

    public boolean validateAccessToken(String token){
        //return validateJwtToken(token) && "access".equals(getTokenType(token));
        return "access".equals(getTokenType(token));
    }

    public boolean validateRefreshToken(String token){
        return validateJwtToken(token) && "refresh".equals(getTokenType(token));
    }

    public String extractTokenFromCookie(HttpServletRequest request, String cookieName){
        Cookie[] cookies = request.getCookies();
        if(cookies != null){
            for(Cookie cookie : cookies){
                if(cookieName.equals(cookie.getName())){
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String buildToken(UserDetailsImpl userDetails, Map<String, Object> extraClaims, String type,
                              long expirationMs) {
        Date now = new Date();
        JwtBuilder builder = Jwts.builder()
                .subject(userDetails.getEmail())
                .claim("id", userDetails.getId())
                .claim("type", type)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(keyValue);

        extraClaims.forEach(builder::claim);
        return builder.compact();
    }

    // Key caching — keyValue field + @PostConstruct.
    @PostConstruct
    private void getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        keyValue = Keys.hmacShaKeyFor(keyBytes);
    }
}
