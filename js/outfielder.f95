Program Outfielder

! declarations

    implicit none
    double precision m, circ, vmph, theta, phi, phifinal, k, a, area, dd, alpha, rr, ttilde, gamm, Vprime
    double precision tau, tau0, tau1, tau2, dt, tempF, elevft, RH, pressurein, beta, pi, h, hmax, phiR, tmax, dmax
    double precision wb, wg, ws, temp, elev, pressure, SVP, rhoSI, rhoI, tc, xc, yc, zc, psi
    double precision wx, wy, wz, w, wpar, wperp, g, Cd, Cm, S, ax, ay, az, ww
    double precision deltaphi0, xx0, yy0, Vtmax, Vt, phiTP, rad, ds
    double precision dptplane, ang, deltat
    integer b, i, n, c, NMAX, ic, n0
    parameter (NMAX=1000)                                           ! allow for hang times of up to 10 seconds
    double precision t(0:NMAX), x(0:NMAX), y(0:NMAX), z(0:NMAX)     ! ball positions
    double precision d(0:NMAX)                                      ! horizontal distance traveled by ball
    double precision vx(0:NMAX), vy(0:NMAX), vz(0:NMAX), v(0:NMAX)  ! ball velocities
    double precision xx(3,0:NMAX), yy(3,0:NMAX)                     ! fielder positions; 1 = TP, 2 = OAC, 3 = AAC
    double precision vvx(3,0:NMAX), vvy(3,0:NMAX), vv(3,0:NMAX)     ! fielder velocities
    double precision Dist(3), Vave(3)                               ! total distance traveled, average speed
    common/ball/t,x,y,z,vx,vy,vz,v,h,n
    common/fielder/xx,yy,vvx,vvy,vv

! calculation inputs

    pi = 3.1415926535897932384626d0     ! pi  
    dt = 0.01d0                         ! time step (s)

! ball inputs

    m = 5.125d0         ! ball mass (oz)
    circ = 9.125d0      ! ball circumference (inches)
    x(0) = 0.0d0        ! initial ball position when it exits the bat (ft)
    y(0) = 0.0d0         
    z(0) = 3.0d0
    t(0) = 0.d0         ! initial time
    h = 5.0d0           ! final height of the ball when it is caught (ft)
    vmph = 100.d0       ! ball exit speed (mph)
    theta = 30.d0       ! launch angle of the ball above the horizontal (degrees)
    phi =   0.d0       ! initial bearing angle of the ball measured horizontally to the right of the y axis (degrees)
    b = 1               ! batter handedness (1 = right hand, -1 = left hand)
    
! fielder inputs

    xx0 = -50.d0        ! initial fielder position (ft)
    yy0 = 500.d0        ! RF: (220,300) CF: (38,410) LF: (-200,370)
    tau = 0.0d0         ! response time (s) (if tau1 > 0 and tau2 > 0, then set tau = 0)
    tau1 = 0.5d0        ! initial time delay constant 1 (s) (If tau > 0, then set tau1 = tau2 = 0)
    tau2 = 1.5d0        ! initial time delay constant 2 (s)
    deltaphi0 = 5.d0    ! angle spread delta phi_0 for initial response time calculation (deg)
    gamm = 1.0d0        ! fielder sprint time constant (gamma, 1/s)
!    Vtmax = 1000000.0d0   ! maximum terminal velocity of fielder (ft/s)
    Vtmax = 30.0d0      ! maximum terminal velocity of fielder (ft/s)
    
! field inputs

    tempF = 70.0d0          ! air temperature (degrees Farenheit)
    elevft = 15.0d0         ! field elevation (ft above sea level)
    RH = 50.0d0             ! air relative humidity (%)
    pressurein = 29.92d0    ! air barometric pressure (inches of Hg)
    beta = 0.0001217d0      ! air pressure decay constant (1/m)
    g = 32.174d0            ! acceleration of gravity (ft/s^2)
    ds = 1.d0               ! set ds = 1 to include drag and spin in calculating the ball trajectory, and set ds = 0 to ignore them
    
! ball initializations

    a = circ/2/pi/12.                 ! ball radius (ft)
    area = pi*a*a                     ! ball cross sectional area (ft^2)
    v(0) = vmph*5280.d0/3600.d0       ! ball exit speed (ft/s) (Nathan writes v = vmph*1.467d0)
    d(0) = 0.d0
    wb = -763 + 120*theta + 21*phi*b  ! initial backspin of the ball (rpm, positive for backspin and negative for topspin)
    ws = -b*849 - 94*phi              ! initial sidespin of the ball (rpm, positive for balls swerving toward the left field foul line)
    wg = 0.0d0                        ! initial gyrospin of the ball about the velocity axis (rpm)
    w = sqrt(wb**2+ws**2+wg**2)       ! ball spin magnitude (constant, rpm)
    vx(0) = v(0)*cos(theta*pi/180)*sin(phi*pi/180)  ! exit velocity components (ft/s)
    vy(0) = v(0)*cos(theta*pi/180)*cos(phi*pi/180) 
    vz(0) = v(0)*sin(theta*pi/180)                  
    wx =  wb*cos(phi*pi/180)-ws*sin(theta*pi/180)*sin(phi*pi/180)+wg*vx(0)/v(0) ! ball Cartesian spin components (constant, rpm)
    wy = -wb*sin(phi*pi/180)-ws*sin(theta*pi/180)*cos(phi*pi/180)+wg*vy(0)/v(0)
    wz =  ws*cos(theta*pi/180)+wg*vz(0)/v(0)    
    
! field initializations

    temp = (5.0d0/9.0d0)*(tempF-32)           ! air temperature (degrees Celsius)
    elev = elevft/3.2808d0                    ! field elevation (m above sea level)
    pressure = pressurein*1000/39.37          ! air barometric pressure (mm of Hg)
    SVP = 4.5841d0*exp((18.687d0-temp/234.5d0)*temp/(257.14d0+temp))  ! air saturation vapor pressure (mm of Hg)
    rhoSI = 1.2929d0*(273/(temp+273)*(pressure*exp(-beta*elev)-0.3783d0*RH*SVP/100)/760) ! air mass density (kg/m^3)
    rhoI = rhoSI*0.06261d0                    ! air mass density (lb/ft^3)
    k = rhoI*area*16/2/m                      ! force constant (1/ft) (Nathan writes k = 0.07182d0*rhoI*(5.125d0/m)*(circ/9.125)**2.)

! calculate baseball trajectory

    hmax = 0.d0                                     ! initialize the maximum height of the ball
    tc = 0.d0                                       ! initialize the hang time (total time the ball is in the air)
    i = 0                                           ! initialize the step count
    do while (tc.eq.0.d0)                           ! finish finding variables at the current time step
      v(i) = sqrt(vx(i)**2 + vy(i)**2 + vz(i)**2)   ! ball speed
      wpar = (vx(i)*wx + vy(i)*wy + vz(i)*wz)/v(i)  ! component of the ball's angular velocity that is parallel to its velocity
      wperp = sqrt(w**2-wpar**2)                    ! component of the ball's angular velocity that is perpendicular to its velocity
      S = pi*a*wperp/30/v(i)                        ! spin factor
      Cd = 0.3008 + 0.0000292d0*wperp               ! drag coefficient
      Cm = 1.12d0*S/(0.583d0+2.333d0*S)             ! Magnus coefficient
      ax =    -ds*k*Cd*v(i)*vx(i) + ds*k*Cm*(wy*vz(i)-wz*vy(i))*v(i)/wperp  ! acceleration
      ay =    -ds*k*Cd*v(i)*vy(i) + ds*k*Cm*(wz*vx(i)-wx*vz(i))*v(i)/wperp
      az = -g -ds*k*Cd*v(i)*vz(i) + ds*k*Cm*(wx*vy(i)-wy*vx(i))*v(i)/wperp  ! print variables after this step
      i = i + 1                                     ! increment step count
      if (i.gt.NMAX) then
        print *, "i > NMAX"
        stop
      endif
      t(i) = dt*i                                   ! increment time
      x(i) = x(i-1) + vx(i-1)*dt + 0.5d0*ax*dt*dt   ! calculate new ball position
      y(i) = y(i-1) + vy(i-1)*dt + 0.5d0*ay*dt*dt
      z(i) = z(i-1) + vz(i-1)*dt + 0.5d0*az*dt*dt
      d(i) = sqrt(x(i)**2+y(i)**2)
      if (z(i).gt.hmax) then
        hmax = z(i)                                 ! update maximum height
        tmax = t(i)
        dmax = sqrt(x(i)**2+y(i)**2)
      endif
      vx(i) = vx(i-1) + dt*ax                       ! calculate new ball velocity
      vy(i) = vy(i-1) + dt*ay
      vz(i) = vz(i-1) + dt*az
      if (z(i).lt.h .and. z(i-1).gt.h) then         ! the ball descends below the final height h; interpolate landing position
        tc = t(i-1) + (h-z(i-1))*dt/(z(i)-z(i-1))   ! time at which the ball passes through the final height
        xc = x(i-1) + (x(i)-x(i-1))*(tc-t(i-1))/dt  ! ball position at time of catch
        yc = y(i-1) + (y(i)-y(i-1))*(tc-t(i-1))/dt
        zc = h
        t(i) = tc                                   ! store landing time and position as the last entry in the arrays
        ic = i
        x(i) = xc
        y(i) = yc
        z(i) = zc
        phifinal = atan(xc/yc)*180/pi               ! ball bearing angle at time of catch
        d(i) = sqrt(xc**2+yc**2)                    ! ball horizontal distance from home plate at time of catch
        ang = abs(phifinal-phi)*pi/180
        dptplane = d(i)*sin(ang)                    ! distance from landing point to initial plane of motion
        print *, tc, d(i), hmax, tmax, dmax, phifinal, xc, yc, wb, ws, dptplane
      endif
    enddo

! fielder initializations

    n = tau/dt                                            ! number of time steps of response time (hundredths of a second for dt = 0.01 s)
    phiR = atan2(xx0,yy0)*180.d0/pi                       ! bearing angle of initial position vector of fielder (deg)
    tau0 = tau1 + tau2*exp(-(phiR-phi)**2/deltaphi0**2)   ! initial time delay (s)
    n0 = tau0/dt                                          ! number of time steps of initial time delay (hundredths of a second for dt = 0.01 s)
    if (n+n0 .gt. NMAX) then
      print *, "n+n0 > NMAX"
      stop
    endif
    if (z(n0).lt.h) then ! hold the fielder stationary until the ball is at or above the horizontal direction
      i = 1
      do while (z(n0+i).lt.h)
        i = i + 1
      enddo
      n0 = n0 + i ! increase the initial delay time n0 so that the z(n0) is greater than or equal to h
    endif
    do c = 1, 3    ! keep the fielder at his initial position during the response time and the initial delay time
      dist(c) = 0.d0
      do i = 0, n + n0
        xx(c,i) = xx0
        yy(c,i) = yy0
        vvx(c,i) = 0.d0
        vvy(c,i) = 0.d0
      enddo
    enddo
    
! determine TP fielder motion (c = 1)

    c = 1
    ttilde = (n+n0)*dt                      ! time when fielder starts accelerating from rest (s)
    dd = sqrt((xc-xx0)**2+(yc-yy0)**2)      ! initial horizontal distance from fielder to ball (ft)
    phiTP = atan2(xc-xx0,yc-yy0)            ! bearing angle of fielder to ball (measured to the right of the y axis)
    Vt = gamm*dd/(exp(-gamm*(tc-ttilde)) - 1.d0 + gamm*(tc-ttilde)) ! terminal speed (ft/s)
    if (Vt .gt. Vtmax) then
      print *, Vt, Vtmax, "TP unsuccessful"
      Vt = Vtmax
    endif
    do i = n + n0 + 1, ic
      rr = Vt*(t(i)-ttilde) + Vt*(exp(-gamm*(t(i)-ttilde)) - 1.d0)/gamm
      vv(c,i) = Vt*(1-exp(-gamm*(t(i)-ttilde)))
      xx(c,i) = xx0 + rr*sin(phiTP)
      yy(c,i) = yy0 + rr*cos(phiTP)
      vvx(c,i) = vv(c,i)*sin(phiTP)
      vvy(c,i) = vv(c,i)*cos(phiTP)
    enddo
    Dist(c) = sqrt((xx(c,ic)-xx0)**2 + (yy(c,ic)-yy0)**2)
    Vave(c) = Dist(c)/(tc-ttilde)
    
! determine OAC (c = 2) and AAC (c = 3) fielder motion
    
    do c = 2, 3
      i = n + n0                                        ! time when fielder starts accelerating from rest
      call setangles(c,i,ww,psi,alpha)
      do i = n + n0 + 1, ic
        if (c .eq. 2) then
          alpha = alpha + ww*(t(i)-t(i-1))*(cos(alpha))**2
        else
          alpha = alpha + ww*(t(i)-t(i-1))
        endif
        dd = (z(i-n)-h)/tan(alpha)                      ! new fielder-ball distance
        xx(c,i) = x(i-n) + dd*sin(psi)                  ! new fielder position
        yy(c,i) = y(i-n) + (xx(c,i)-x(i-n))/tan(psi)
        vvx(c,i) = (xx(c,i)-xx(c,i-1))/(t(i)-t(i-1))    ! new fielder velocity
        vvy(c,i) = (yy(c,i)-yy(c,i-1))/(t(i)-t(i-1))
        vv(c,i) = sqrt(vvx(c,i)**2 + vvy(c,i)**2)
        deltat = t(i)-t(i-1)
        if (vv(c,i).gt.vv(c,i-1)) then                  ! fielder speed is increasing with time
          Vprime = Vtmax - (Vtmax-vv(c,i-1))*exp(-gamm*(t(i)-t(i-1)))
          if (vv(c,i).gt.Vprime) then
            call scalecoordinates(c,i,deltat,Vprime)
            call setangles(c,i,ww,psi,alpha)
          endif
        else                                            ! fielder speed is decreasing with time
          Vprime = Vtmax - (Vtmax-vv(c,i-1))*exp(gamm*(t(i)-t(i-1)))
          if (vv(c,i).lt.Vprime) then
            call scalecoordinates(c,i,deltat,Vprime)
            call setangles(c,i,ww,psi,alpha)
          endif
        endif
        Dist(c) = Dist(c) + sqrt((xx(c,i)-xx(c,i-1))**2 + (yy(c,i)-yy(c,i-1))**2)
      enddo
      Vave(c) = Dist(c)/(tc-ttilde)
    enddo

! output results

    do c = 1, 3
      write (*,'(90(f12.6,","))') Dist(c), Vave(c)
    enddo
    open(file="output.csv",unit=11,status="unknown")
    write (11,*)"t, x, y, z, d, X1, Y1, Vx1, Vy1, V1, X2, Y2, Vx2, Vy2, V2, X3, Y3, Vx3, Vy3, V3"
    do i = 0, ic
      write (11,'(90(f12.6,","))') t(i), x(i), y(i), z(i), d(i), xx(1,i), yy(1,i), vvx(1,i), vvy(1,i), vv(1,i), &
        xx(2,i), yy(2,i), vvx(2,i), vvy(2,i), vv(2,i), xx(3,i), yy(3,i), vvx(3,i), vvy(3,i), vv(3,i)
    enddo
    close(unit=11)

End Program Outfielder

subroutine setangles(c,i,ww,psi,alpha)
    implicit none
    integer c, i, n, NMAX
    parameter (NMAX=1000)                                           ! allow for hang times of up to 10 seconds
    double precision t(0:NMAX), x(0:NMAX), y(0:NMAX), z(0:NMAX)     ! ball positions
    double precision vx(0:NMAX), vy(0:NMAX), vz(0:NMAX), v(0:NMAX)  ! ball velocities
    double precision xx(3,0:NMAX), yy(3,0:NMAX)                     ! fielder positions; 1 = TP, 2 = OAC, 3 = AAC
    double precision vvx(3,0:NMAX), vvy(3,0:NMAX), vv(3,0:NMAX)     ! fielder velocities
    double precision dd, dddot, ll, ww, psi, alpha, h
    common/ball/t,x,y,z,vx,vy,vz,v,h,n
    common/fielder/xx,yy,vvx,vvy,vv
    dd = sqrt((x(i-n)-xx(c,i))**2 + (y(i-n)-yy(c,i))**2) ! horizontal distance D between fielder and previous ball position
    ll = sqrt(dd**2 + (z(i-n)-h)**2) ! total distance L between fielder and previous ball position
    dddot = ((x(i-n)-xx(c,i))*(vx(i-n)-vvx(c,i)) + (y(i-n)-yy(c,i))*(vy(i-n)-vvy(c,i)))/dd ! time derivative of D
    if (c .eq. 2) then
      ww = (vz(i-n)*dd - dddot*(z(i-n)-h))/dd**2 ! OAC Omega based on previous position of ball and current position of fielder
    else 
      ww = (vz(i-n)*dd - dddot*(z(i-n)-h))/ll**2 ! AAC Omega based on previous position of ball and current position of fielder
    endif
    psi = atan2(xx(c,i)-x(i-n),yy(c,i)-y(i-n)) ! azimuthal angle of ball based on ...
    alpha = atan2(z(i-n)-h,dd)                 ! time-delayed elevation angle of ball based on ...
    return
    end
    
subroutine scalecoordinates(c,i,deltat,Vprime)
    implicit none
    integer c, i, NMAX
    parameter (NMAX=1000)                                           ! allow for hang times of up to 10 seconds
    double precision eta, Vprime, deltat
    double precision xx(3,0:NMAX), yy(3,0:NMAX)                     ! fielder positions; 1 = TP, 2 = OAC, 3 = AAC
    double precision vvx(3,0:NMAX), vvy(3,0:NMAX), vv(3,0:NMAX)     ! fielder velocities
    common/fielder/xx,yy,vvx,vvy,vv
    eta = Vprime/vv(c,i)
    vv(c,i) = eta*vv(c,i)
    vvx(c,i) = eta*vvx(c,i)
    vvy(c,i) = eta*vvy(c,i)
    xx(c,i) = xx(c,i-1) + deltat*vvx(c,i)
    yy(c,i) = yy(c,i-1) + deltat*vvy(c,i)
    return
    end

