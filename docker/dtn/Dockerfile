FROM ubuntu:latest

RUN apt-get update

RUN apt-get -y install iproute2
RUN apt-get -y install apt-utils
RUN apt-get -y install net-tools
RUN apt-get -y install iputils-ping
RUN apt-get -y install wget
RUN apt-get -y install vim
RUN apt-get -y install default-jdk

# iperf3
RUN apt-get install -y iperf3
EXPOSE 5201

# python is always useful to have.
RUN apt-get -y install python

RUN apt update  && apt upgrade -y && apt-get -y  install  openssh-server

RUN sed -ri 's/^#?PermitRootLogin\s+.*/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -ri 's/UsePAM yes/#UsePAM yes/g' /etc/ssh/sshd_config
RUN mkdir /var/run/sshd
RUN chmod 0755 /var/run/sshd

#RUN mkdir /root/.ssh
#RUN ssh-keygen -A


#EXPOSE 11022

CMD /usr/sbin/sshd -D -p $sshd_port -b $sshd_bind
#CMD    ["/usr/sbin/sshd", "-D"]

RUN rm -rf /var/lib/apt/lists/*


