package smac.compiler.compilador;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import smac.compiler.compilador.mongo.AccionRegistroUsuario;

@Configuration
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(AccionRegistroUsuario accionRegistroUsuario) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(accionRegistroUsuario);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationProvider authenticationProvider) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authenticationProvider(authenticationProvider)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(
                    "/loginSmaCly.html",
                    "/registroSmaCly.html",
                    "/accesoDenegado.html",
                    "/styles.css",
                    "/iconoNavegador.ico",
                    "/logoSmaCly2.png",
                    "/iconoAccesoDenegado.svg",
                    "/iconoApagado.svg",
                    "/iconoEditorSmaCly.png",
                    "/iconoWorkspace.png",
                    "/iconoUsuario.png",
                    "/iconoVariosUsuarios.png",
                    "/js/**",
                    "/api/prueba",
                    "/api/registrarUsuario"
                ).permitAll()
                //HOME DE LA APLICACIÓN
                .requestMatchers("/home.html").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers("/editor.html").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers("/edicion_datos_usuario.html").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers("/workspaces.html").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers("/gestion_usuarios.html").hasAnyAuthority("PROFESSOR", "ADMIN")
                //COMPILER & LOGS SMART CONTRACTS (SOLIDITY & VYPER)
                .requestMatchers(HttpMethod.POST, "/api/compilarSolidity").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/compilarVyper").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/registrarLogs").authenticated()

                .requestMatchers(HttpMethod.GET, "/api/admin/usuarios/gestionables").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/admin/usuarios").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/admin/usuarios/*").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/admin/usuarios","/api/admin/usuarios/*").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/admin/usuarios/*/bloqueo").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.POST,"/api/admin/usuarios/carga-masiva").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET,"/plantilla_carga_usuarios.xlsx").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/miPerfil").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/miPerfil").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")

                .requestMatchers(HttpMethod.GET, "/api/workspaces/visibles").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/listarWorkspaces").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/ultimoWorkspace").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/cargarWorkspace").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/crearWorkspace").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/registrarWorkspace").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/workspaces","/api/workspaces/*").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")

                .requestMatchers("/logs.html").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/logs/mostrarLogs").hasAnyAuthority("USER", "PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/logs").hasAnyAuthority("PROFESSOR", "ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/api/logs/sesion/*").hasAnyAuthority("PROFESSOR", "ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/e3value/contratos").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/e3value/eventos").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/e3value/preguntasObjetos").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/e3value/convertirE3Value").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/e3value/validar").authenticated()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/loginSmaCly.html")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/home.html", true)
                .failureUrl("/loginSmaCly.html?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/loginSmaCly.html?logout=true")
                .permitAll()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.sendRedirect("/accesoDenegado.html?tipo=noauth");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    response.sendRedirect("/accesoDenegado.html?tipo=noperm");
                })
            );

        return http.build();
    }
}